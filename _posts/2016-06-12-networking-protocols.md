---
layout: post
title: Better Networking with Argo in Swift
---

As an iOS developer, I was married to the API singleton. Making something along the lines of `NetworkingManager` or `APIManager` was second nature to me. This was _the_ object which all networking calls would go through. The gatekeeper of sorts. But as your application grows in complexity, this gatekeeper's responsibilty starts growing vast and its reach wide which makes your code less maintainable and harder to test. It also may be the case that you need to bypass the gatekeeper for some special request. You start sprinkling these requests that talk directly with your API that, for some reason, slip by your networking manager. The role of our manager becomes unclear now...

# Swift to the rescue!

Lets look at a common `NetworkManager` you may see or implement

``` swift
class NetworkManager {
	static let sharedManager = NetworkManager()
	
	// Log a user in with their username and password
	func login(userName: String, password: String, completion: ((AnyObject?, NSError?) -> Void)? {
		// Make a network call, return the resulting JSON or an error in the completion paramters
	}
	
	// Get a user's news feed based on their id
	func newsFeed(userId: String, completion: ((AnyObject?, NSError?) -> Void)?) {
		// Make a network call, return the resulting JSON or an error in the completion paramters
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

I've been using a couple of libraries called [Argo]() and [Curry]() by Thoughtbot. Argo is a clean and functional JSON parsing library, and Curry is a method currying library (you can read more about them on [Thoughtbot's blog]()). Essentially, it maps your JSON responses into a model object for you so you don't have to worry about making your own JSON parsers, the pyramid of doom or anything like that. To show you the awesomeness lets make a model for a `User` and our `NewsFeed`

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

This is our basic model of what could be a `User` and `NewsFeed`. We may get more info in the JSON, but it doesn't matter. Argo will only parse out the things needs to make the model. But how does it make the model? We need to implement the `Decodable` protocol on these models which will take a JSON and decode it into our models above. So lets implement that!

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

For a `User`, we're expecting a basic JSON object with the fields `"userName"`, `"email"`, and an optional field, `"fullName"`. Argo will take that JSON response and map the `userName` and `email` into the object and the `fullName` only if it exists. If not, it'll ignore it and put `nil` in. If any of these mapping operations fail, then the object will not be created which is expected and wanted. The same idea goes for our `NewsFeed` and `NewsFeedPost` objects. For those, we're expecting a JSON object with an array of JSON objects that are the posts. Argo will decode the array for you so long as the objects in the array are also decodable. Super nice, right? Now lets go back to talking about the networking behind this.

# A Better Networking Layer

A core principle of OOP is that classes have single responsibility. So why is one object handling _all_ network requests? You could argue that the core responsibility of the `NetworkManager` is to make network calls, but that's too broad of a responsibility. Much like in web development, we can create services for each type of API category of calls. So looking ar our `NetworkManager` we have a call for a user for some credentials and their news feed. Lets break that up into their own service.

``` swift
class UserService {
	// Log a user in with their username and password
	func login(userName: String, password: String, completion: ((AnyObject?, NSError?) -> Void)? {
		// Make a network call, return the resulting JSON or an error in the completion paramters
	}
}
```

``` swift
class NewsFeedService {
	// Get a user's news feed based on their id
	func newsFeed(userId: String, completion: ((AnyObject?, NSError?) -> Void)?) {
		// Make a network call, return the resulting JSON or an error in the completion paramters
	}
}
```

Awesome! So we've extracted out our network calls into their own classes. Now we have a decent degree of separation between the two. But this still doesn't solve the problem we face with the repetitive networking code. Both of these requests are most likely `GET` requests and will be constructed the same way. The only difference between them will be how the JSON is handled. Good thing our Argo models handle that JSON request for us! We can update these calls to now give back our models instead of `AnyObject?` like so

``` swift
class UserService {
	// Log a user in with their username and password
	func login(userName: String, password: String, completion: ((User?, NSError?) -> Void)? {
		// Make a network call, return the resulting JSON or an error in the completion paramters
	}
}
```

``` swift
class NewsFeedService {
	// Get a user's news feed based on their id
	func newsFeed(userId: String, completion: ((NewsFeed?, NSError?) -> Void)?) {
		// Make a network call, return the resulting JSON or an error in the completion paramters
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

Our goal here is to reduce the repetitiveness in our services. We saw our decoding code (and networking code) is pretty repetitive. We made the observation that we could create a superclass, but that protocols are supreme (for some reason?). At least you'll that see after this.

