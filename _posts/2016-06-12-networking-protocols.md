---
layout: post
title: Better Networking with Argo in Swift
---

As an iOS developer, I was married to the API singleton. Making something along the lines of `NetworkingManager` or `APIManager` was second nature to me. This was _the_ object which all networking calls would go through. The gatekeeper of sorts. But as your application grows in complexity, this gatekeeper's responsibility starts growing vast and its reach wide which makes your code less maintainable and harder to test. It also may be the case that you need to bypass the gatekeeper for some special request. You start sprinkling these requests that talk directly with your API that, for some reason, slip by your networking manager. The role of our manager becomes unclear now...

# Swift to the rescue!

Lets look at a common `NetworkManager` you may see or implement

``` swift
class NetworkManager {
    static let sharedManager = NetworkManager()

    // Log a user in with their username and password
    func login(userName: String, password: String, completion: ((AnyObject?, NSError?) -> Void)? {
        // Make a network call, return the resulting JSON or an error in the completion parameters
    }
	
    // Get a user's news feed based on their id
    func newsFeed(userId: String, completion: ((AnyObject?, NSError?) -> Void)?) {
        // Make a network call, return the resulting JSON or an error in the completion parameters
    }
}
```

and then you'd call a method like so

``` swift
NetworkManager.sharedManager.login("example@gmail.com", password: "tester1") { json, error in 
    // Do something with JSON or error
}
```

This seems reasonable, but you can see how the `NetworkManager` can become large. Imagine every network call gets a method, then you try to refactor common chunks of code into their own methods, but those methods aren't generic enough to handle _all_ requests of that type, so you implement the same-ish thing and put _that_ into its own method and so on. What it boils down to is every API call needs to be handled differently. Odds are, you're going to do something different with a user response than a news feed response.

# Argo Models FTW

I've been using a couple of libraries called [Argo](https://github.com/thoughtbot/Argo) and [Curry](https://github.com/thoughtbot/Curry) by Thoughtbot. Argo is a clean and functional JSON parsing library, and Curry is a method currying library (you can read more about them on [Thoughtbot's blog](https://robots.thoughtbot.com)). Essentially, it maps your JSON responses into a model object for you so you don't have to worry about making your own JSON parsers, the pyramid of doom or anything like that. To show you the awesomeness lets make a model for a `User` and our `NewsFeed`

``` swift
import Argo
import Curry

struct User {
    let userName: String
    let email: String
    let fullName: String?
}
```

``` swift
import Argo
import Curry

struct NewsFeed {
    let posts: [NewsFeedPost]
}

struct NewsFeedPost {
    let title: String
    let datePosted: String
    let headline: String
}
```

This is our basic model of what could be a `User` and `NewsFeed`. We may get more info in the JSON, but it doesn't matter. Argo will only parse out the things it needs to make the model. But how does it make the model? We need to implement the `Decodable` protocol on these models which will take a JSON and decode it into our models above. So lets implement that!

``` swift
extension User: Decodable {
    static func decode(j: JSON) -> Decoded<User> {
        return curry(self.init)
            <^> j <| "userName"
            <*> j <| "email"
            <*> j <|? "fullName"
    }
}
```

``` swift
extension NewsFeed: Decodable {
    static func decode(j: JSON) -> Decoded<NewsFeed> {
        return curry(self.init)
            <^> j <|| "posts"
    }
}

extension NewsFeedPost: Decodable {
    static func decode(j: JSON) -> Decoded<NewsFeedPost> {
        return curry(self.init)
            <^> j <| "title"
            <*> j <| "postDate"
            <*> j <| "headline"
    }
}
```

For a `User`, we're expecting a basic JSON object with the fields `"userName"`, `"email"`, and an optional field, `"fullName"`. Argo will take that JSON response and map the `userName` and `email` into the object and the `fullName` only if it exists. If not, it'll ignore it and put `nil` in. If any of these mapping operations fail, then the object will not be created which is expected and desired. The same idea goes for our `NewsFeed` and `NewsFeedPost` objects. For those, we're expecting a JSON object with an array of JSON objects that are the posts. Argo will decode the array for you so long as the objects in the array are also decodable. Super nice, right? Now lets go back to talking about the networking behind this.

# A Better Networking Layer

A core principle of OOP is that classes have single responsibility. So why is one object handling _all_ network requests? You could argue that the core responsibility of the `NetworkManager` is to make network calls, but that's too broad of a responsibility. Much like in web development, we can create services for each type of API category of calls. So looking at our `NetworkManager` we have a call for a user for some credentials and their news feed. Lets break that up into their own service.

``` swift
class UserService {
    // Log a user in with their username and password
    func login(userName: String, password: String, completion: ((AnyObject?, NSError?) -> Void)? {
        // Make a network call, return the resulting JSON or an error in the completion parameters
    }
}
```

``` swift
class NewsFeedService {
    // Get a user's news feed based on their id
    func newsFeed(userId: String, completion: ((AnyObject?, NSError?) -> Void)?) {
        // Make a network call, return the resulting JSON or an error in the completion parameters
    }
}
```

Awesome! So we've extracted out our network calls into their own classes. Now we have a decent degree of separation between the two. But this still doesn't solve the problem we face with the repetitive networking code. Both of these requests are most likely `GET` requests and will be constructed the same way. The only difference between them will be how the JSON is handled. Good thing our Argo models handle that JSON request for us! We can update these calls to now give back our models instead of `AnyObject?` like so

``` swift
class UserService {
    // Log a user in with their username and password
    func login(userName: String, password: String, completion: ((User?, NSError?) -> Void)? {
        // Make a network call, return the resulting JSON or an error in the completion parameters
    }
}
```

``` swift
class NewsFeedService {
    // Get a user's news feed based on their id
    func newsFeed(userId: String, completion: ((NewsFeed?, NSError?) -> Void)?) {
        // Make a network call, return the resulting JSON or an error in the completion parameters
    }
}
```

Notice how we now send back a `User?` or `NewsFeed?` object back in the completion. This is already extremely powerful because we're getting back the exact object we need at the call site instead of a hand-wavy `AnyObject`. The last step, though, is how do we actually decode our JSON into these models? Assuming you know how to make a request via your preferred networking solution of choice, lets just look at what to do after we get a response.

``` swift
class UserService {
    // Log a user in with their username and password
    func login(userName: String, password: String, completion: ((User?, NSError?) -> Void)? {
        // Make a network call
        guard let json = response else {
            let error = NSError(...)
            completion(nil, error)
        }
		
        let decodedUser: Decoded<User> = decode(json) // This does the decoding
        switch decodedUser {
            case .Success(let user):
                completion(user, nil) // We're good!
            case .Failure(let error):
                completion(nil, error) // A decoding error generated by Argo
        }
    }
}
```

``` swift
class NewsFeedService {
    // Get a user's news feed based on their id
    func newsFeed(userId: String, completion: ((NewsFeed?, NSError?) -> Void)?) {
        // Make a network call
        guard let json = response else {
            let error = NSError(...)
            completion(nil, error)
        }
		
        let decodedNewsFeed: Decoded<NewsFeed> = decode(json) // This does the decoding
        switch decodedNewsFeed {
            case .Success(let newsFeed):
                completion(newsFeed, nil) // We're good!
            case .Failure(let error):
                completion(nil, error) // A decoding error generated by Argo
        }
    }
}
```

If maintaining error information from the decoding process isn't your jam, then you could decode the model like so

``` swift
let user: User? = decode(json)
```

Then unwrap it before sending it back through the completion.

This is great, but still really repetitive. We're doing the same decoding process for each of our models in different classes. As good object oriented programmers we think "Inheritance is the key! Lets just make a super class and throw this functionality in there." But wait, we're living in the world of Swift now. Why create a super class? That involves overhead and creates sharing problems and more gross complexity stuff. Why not make a `protocol`? After all, Swift is touted as a Protocol-Oriented Language. Lets leverage the power of protocols here.

# Protocols to Seal the Deal

Our goal here is to reduce the repetitiveness in our services. We saw our decoding code (and networking code) is pretty repetitive. We made the observation that we could create a superclass, but were told that protocols are supreme (for some reason?). Lets see what protocols can do for us here.

We have this block of code that's pretty similar amongst all of the services we've implemented:

``` swift
// Make a network call
guard let json = response else {
    let error = NSError(...)
    completion(nil, error)
}
    
let decodedModel: Decoded<...> = decode(json)
switch decodedModel {
    case .Success(let model):
        completion(model, nil) // We're good!
    case .Failure(let error):
        completion(nil, error) // A decoding error generated by Argo
}
```

That's OK, but we're good developers and we love clean, non-repetitive code. Lets think about what makes a service a service. It makes requests within its context and handles the responses for those requests. Ok, cool. Let start by making a protocol that makes requests.

``` swift
protocol Service {
    func getRequest(url: String, parameters: [String: AnyObject]?, headers: [String: String]?, completion: ((???, ErrorType?) -> Void))
}
```

Hold up one second... what's suppose to go in the first argument of the `completion` argument? How do we know what model we're going to pass back in the protocol? `associatedType` comes to the rescue! We can alias a type in the protocol itself, then in the implementing class, tell our protocol what type it _should_ be. So by adding an `associatedType` we can fill in our first argument in the completion closure.

``` swift
protocol Service {
    associatedType Model
    func getRequest(url: String, parameters: [String: AnyObject]?, headers: [String: String]?, completion: ((Model?, ErrorType?) -> Void))
}
```

Awesome! Now we have a pretty sweet looking protocol, but how does this help us achieve our goal of moving our repetitive code out from our services? What we can do is define a default behavior for our `Service` protocol. What this allows us to do is fallback onto our pre-implemented behavior if the implementing class does not provide a custom implementation for a method. Lets create some default behavior for our `GET` request method with our redundant code from our services.

``` swift
protocol Service {
    associatedType Model
    func getRequest(url: String, parameters: [String: AnyObject]?, headers: [String: String]?, completion: ((Model?, ErrorType?) -> Void))
}

extension Service {
    func getRequest(url: String, parameters: [String: AnyObject]?, headers: [String: String]?, completion: ((Model?, ErrorType?) -> Void)) {
        // Make a network call
        guard let json = response else {
            let error = NSError(...)
            completion(nil, error)
        }
		    
        let decodedModel: Decoded<Model> = decode(json)
        switch decodedModel {
        case .Success(let model):
            completion(model, nil) // We're good!
        case .Failure(let error):
            completion(nil, error) // A decoding error generated by Argo
        }
    }
}
```
Nice! Now a class that implements this protocol can actually call this `getRequest` method directly since there's already implementation details for it. It also gives us the flexibility to create a custom implementation for this method if need be. Now there shouldn't be anymore services that slip by our networking layer. There _is_ one little problem though... you'll get a compilation error because our `decode` method isn't visible on the `Model` associated type. So we need to somehow _constrain_ this implementation of our `Service` protocol to only be used for `Model`s that implement the `Decodable` protocol supplied to us by Argo. We can achieve that using a `where` clause for this extension like so

``` swift
extension Service where Model: Decodable, Model.DecodedType == Model
```
Clean and simple :) Now this extension's default behavior will only kick in when the associated type, `Model` conforms to the `Decodable` protocol. Otherwise, you'll _have_ to implement the `Service` protocol's methods. Xcode will even tell you this during compilation due to the strict type system which is also pretty amazing.

# Putting it all together

Now that we have all of the pieces in place. Lets actually see what our result is.

``` swift
protocol Service {
    associatedType Model
    func getRequest(url: String, parameters: [String: AnyObject]?, headers: [String: String]?, completion: ((Model?, ErrorType?) -> Void))
}

extension Service where Model: Decodable, Model.DecodedType == Model {
    func getRequest(url: String, parameters: [String: AnyObject]?, headers: [String: String]?, completion: ((Model?, ErrorType?) -> Void)) {
        // Make a network call
        guard let json = response else {
            let error = NSError(...)
            completion(nil, error)
        }
		    
        let decodedModel: Decoded<Model> = decode(json)
        switch decodedModel {
        case .Success(let model):
            completion(model, nil) // We're good!
        case .Failure(let error):
            completion(nil, error) // A decoding error generated by Argo
        }
    }
}
```

``` swift
class UserService: Service {
    typealias = User
	
    func login(userName: String, password: String, completion: ((User?, NSError?) -> Void)? {
        getRequest("example.com/user", parameters: ["userName": userName, "password": password], headers: nil, completion: completion)
    }
}
```

``` swift
class NewsFeedService: Service {
    typealias = NewsFeed
	
    func newsFeed(userId: String, completion: ((NewsFeed?, NSError?) -> Void)?) {
        getRequest("example.com/newsFeed", parameters: nil, headers: nil, completion: completion)
    }
}
```
And that's it! Now we have a completely flexible networking layer that we can use to create new networking objects. Another major benefit to this is that it gives us a lot of flexibility around testing. It's incredibly easy to create mock objects with a protocol since you can define some test implementation for each method. Protocols aren't dependent on anything either which make them very advantageous when testing.

We can take this one step further and even create a `Result` monad instead of passing back optional `Model` and `ErrorType` in the completion closure of these request methods, but that will be another blog post for another time ;) until then!

Happy Swifting! 