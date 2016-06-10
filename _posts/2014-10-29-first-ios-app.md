---
layout: post
title: Creating Your First iOS App
---

Everyone has a phone. I don't mean a [Motorola Razr](http://parade.condenast.com/wp-content/uploads/2013/04/motorola-razr.jpg) either... (even though those were pretty sweet back in the day). People have devices more powerful than the computer that landed us on the moon for the first time (and they could also stream our music while doing it!). We live in a fast paced world where people have grown impatient and will pay large sums of money for the convenience of being able to find any piece of information they want, when they want it and without moving a finger. That's the world we live in today. Apps are at the center of it all. They act as a gateway to this vast ocean of information and make our lives easier to live. Today I'll be going over the code in the [iOS Starter Kit](https://github.com/cjrieck/ios-quick-start) I've made to help *you* make the lives of others easier.

# The File Structure
Xcode is both a blessing and a curse for sure. It helps us developers a lot with autocompletion and a lot of under the hood type of things. It helps developers out even more now with the advent of [Alcatraz](http://alcatraz.io), the official package manager for Xcode. Definitely install it if you don't have it. Personally, I recommend [Fuzzy Autocomplete](https://github.com/FuzzyAutocomplete/FuzzyAutocompletePlugin) at the bare minimum. I guarantee you'll never learn every single method's spelling and word ordering on every single object by heart. This plugin helps **TREMENDOUSLY**.
Anyways, if you were to create your own Xcode project the directory structure of your app would look like this:

![](http://claytonrieck.com/img/ios-starter-kit/file-structure.png)

This is pretty bad to say the least. There's no structure. All of the files are free floating. What if someone wanted to collaborate with you? What if you just wanted to make an app that was easier to maintain? The file structure is where that begins. Lets look at the starter kit's file structure now:

![](http://claytonrieck.com/img/ios-starter-kit/SK-file-structure.png)

This looks a lot better. Now all of the relevant files are grouped together in clearly defined Groups (or folders). You should always implement good file structures for your apps. It'll make the lives of other developers and your life much easier in the long run. *But* it's not as easy as moving files around in Xcode... the changes to the file structure in Xcode won't be reflected in Finder or on GitHub when you push code out. That's because the files you see in Xcode are just references to the files in your project directory on your machine. When you move files around in Xcode, the references stay the same while the visual structure appears to have changed. Why would we want to mirror the structure in Xcode with the structure on our machine/GitHub? For the same reason we make custom file structures in the first place. It makes our lives as developers easier! Imagine you just need to quickly look at a file in your project without the hassle or wait time to open up Xcode (lets say you want to look at said file on your phone even where you don't have Xcode). You won't be able to find it because all you'll see if a cluster fuck of files with insanely long names all with the same prefix so you need to sift through them one by one because all of the names are cut off etc. Ok, so that would really suck... how do we mirror the file structure in Finder then? Well, there's a tool called [synx](https://github.com/venmo/synx) that does this for us! It's a ruby gem so it can be easily installed with the command `gem install synx`. Then to have it rework the file structure simply call `synx path/to/.xcodeproj`. And voila! We have a neat and organized file structure both in and out of Xcode! Pretty easy huh? Now lets talk about some code and what the hell these files mean and what they do.

# Don't Be Afraid of Objective-C
At first you might be like "What the hell are with all of the brackets?" but don't get too hung up on that. Think of it like dot-notation's long lost brother that only appears in Objective-C. Objective-C is a derivative of C/C++, but more specifically it's a superset of C *more strictly* than C++. If you'd like to read up on that you can do that [here](http://stackoverflow.com/questions/19366134/what-does-objective-c-is-a-superset-of-c-more-strictly-than-c-mean-exactly). So if you've ever written C or C++, then you know some of the inner workings of Objective-C. Either way, it's really only a syntactical barrier if you've ever programmed at all. The best way to overcome this fear is to dive right in to some code, so lets start with the most important file we'll be working with in our app.

# The App Delegate
The application delegate handles the state of the app itself. What are the states? Well lets take a look at the file.

You should see 6 methods with an `application` prefix to them. They are:

``` objc
- (BOOL)application:(UIApplication *)application
       didFinishLaunchingWithOptions:(NSDictionary *)launchOptions  
- (void)applicationWillResignActive:(UIApplication *)application  
- (void)applicationDidEnterBackground:(UIApplication *)application  
- (void)applicationWillEnterForeground:(UIApplication *)application  
- (void)applicationDidBecomeActive:(UIApplication *)application  
- (void)applicationWillTerminate:(UIApplication *)application  
```

These are all of the potential states your app could fall under and they're pretty well defined. Even having never made an app before I can make a pretty good assumption as to when each of these methods are called. Apple also supplies comments in the method definitions to give you a clear understanding of what each one does. This also bleeds in to lifecycles. You may hear about a view lifecycle or an application lifecycle in your journeys as an iOS developer. This isn't anything to be afraid of, but is **very** important to understand. Lifecycle methods get called in a specific order. Looking at our app delegate methods above, lets go through the lifecycle.

When you tap the app icon, the first method to get called is

``` objc
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
```

Your app will then run the code in that method definition until completion or something errors out. Once that completes the next method to be called is

``` objc
- (void)applicationDidBecomeActive:(UIApplication *)application
```

This gets called once everything has been loaded up that needs to be loaded. And that's what happens when your app boots up. Now, what about when you exit? If the user hits the home button, goes into multi-tasking, or if there's an interruption of some kind (e.g. a phone call comes in) the method that gets called is

``` objc
- (void)applicationWillResignActive:(UIApplication *)application
```

So it's *about* to resign it's active state, but it hasn't yet. Once that method completes, the app then runs

``` objc
- (void)applicationDidEnterBackground:(UIApplication *)application
```

Now it's just chilling in the background as you do your thing on your phone. When you open the app again the methods

``` objc
- (void)applicationWillEnterForeground:(UIApplication *)application
- (void)applicationDidBecomeActive:(UIApplication *)application
```

will get called in that order. If you go into multitasking and swipe it away to free up RAM potentially, the method

``` objc
- (void)applicationWillTerminate:(UIApplication *)application
```

will be called. The comments generated in the method definitions give you a more in-depth description as what's best to do in each method. You can also refer to [this StackOverflow link](http://stackoverflow.com/questions/6519847/what-is-the-life-cycle-of-an-iphone-application) for a visual graph of the app lifecycle.

The big method we're concerned for the starter kit is the first one.

``` objc
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
```

When this runs we want to display something to the user. Maybe just a white screen or something with a title at the top? How about both? Lets break that up into 2 parts then. We'll start with displaying the white screen.

Lets look at the code in the quick start code:

``` objc
// 1
self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
self.window.backgroundColor = [UIColor whiteColor];

// 2
ViewController *rootViewController = [[ViewController alloc] init];
UINavigationController *rootNavigationController = [[UINavigationController alloc]
    initWithRootViewController:rootViewController];

// 3
self.window.rootViewController = rootNavigationController;
[self.window makeKeyAndVisible];
```

# 1

Lets take a look at the stuff under the `//1` comment. `window` is a property on the class `AppDelegate` and we want to reference that property view the `self` prefix. If you look at `AppDelegate.h` we can see the `window` property defined as `@property(strong, nonatomic) UIWindow *window`. Lets break down that line:

- `@property` - declares a property of a class (different from an instance variable, but you can think of it in the same light)
- `strong` - keep this in memory until the reference count is 0 (in other words, keep this around until nothing references it)
- `nonatomic` - for simplicity reasons, just know this is thread safe. A more in-depth explanation can be found [here](http://stackoverflow.com/questions/588866/whats-the-difference-between-the-atomic-and-nonatomic-attributes)
- `UIWindow *` - property type
- `window` - property name

This is the anatomy of declaring properties in Objective-C. There are instances where you would use `weak` instead of `strong` and also `readonly` or `readwrite`, but those will be for another time. Getting back to the code, we initialize the window property which also sets its value. It's good to know that `UIWindow` is a subclass of `UIView` and inherits the `initWithFrame:` method. What's the frame of this window going to be though? Well, the size of the screen of course! We don't want our app to be a small window on the screen, so lets fill the screen. We can get the screen's frame by accessing the `bounds` on `[UIScreen mainScreen]` like so, `[[UIScreen mainScreen] bounds]`. So what is a window? A window is where all of your views and view controllers will reside. Think of it like a film in between the physical screen and your app's views. Nothing leaves or leaks outside of the window. We also set the `backgroundColor` to be white, but this is completely optional since the view controller we'll be adding to the window will take precedence and lay on top of the window's background.

# 2

This is where we add the view controller I was just talking about. We instantiate a variable (in this case `rootViewController`) with a type of `ViewController`. NOTE: This is bad naming convention. You should always prefix your classes and give descriptive names. To create a new view controller of type `ViewController` we just call the default `init` method. We actually override that init method, but more on that later...

Next, we instantiate a `UINavigationController`. What is that? Simply put, a navigation controller wraps around view controller and dictates/controls navigation within an app. So most transitions between view controllers are controlled by this single navigation controller. There are instances where you may present views without one, but we won't talk about that in this post. We need to supply the navigation controller with a root view controller, or a view controller to display once the app launches since a navigation controller has no views associated with it on its own. Xcode provides us with a nice method for setting a view controller as the root in a custom init method which you can see is `initWithRootViewController:`. We're going to pass in the view controller we made right above it. That's all there is too it! Now we have a view controller and a navigation controller to control our app navigation from that root view controller.

# 3

We're almost done. Now remember when I said the window is the place where all of the views would reside? Well, right now the window doesn't know about the navigation controller or view controller we just made above it. So we need to attach those to the window somehow. Luckily for us, there's a property on `UIWindow` called `rootViewController` which is rather convenient. We can set any view controller to that property and the window will then display that view controller. Easy enough. The potentially, non-intuitive thing to do would that we have to set the navigation controller as the `rootViewController` on the window. Wha? Why is that?

Simple answer: Because we want all of the control a navigation controller gives us *and* the view controller attached to it. If we just attach the view controller the window won't know about the navigation controller.

Technical Answer: If you're reading this, you're more interested in the "how?" aspect since `rootViewController` is of type `UIViewController`. Well, simply put, `UINavigationController` is a subclass of `UIViewController`. This is also known as the Visitor Pattern where you can use a derived instance of the base class instead of limiting yourself or someone else to that one class. Since `UINavigationController` is a subclass of `UIViewController` we can safely set the `rootViewController` of the `window` to the navigation controller we made.

Lastly, what's `makeKeyAndVisible`? That method displays the window and also makes it the window that receives user interaction (e.g. touches). The window that receives touches is known as the "key window".

That's it for our App Delegate! The Core Data stuff will be a later, more advanced post, but that's all you need to know about the App Delegate for now! Lets move on to `ViewController`!

# The View Controller

View controllers are vital in your app. They're the things that manage views and even other view controllers! Everything done in terms of the UI reside in a view controller. For a more in-depth look, you can refer to [the Apple Doc on View Controllers](https://developer.apple.com/library/ios/featuredarticles/ViewControllerPGforiPhoneOS/Introduction/Introduction.html). Every view controller has a `view` attribute attached to it. This is where you add any other subviews to display. Just like your application, views also have a lifecycle. The methods of the view lifecycle are as follows:

``` objc
- (void)loadView
- (void)viewDidLoad
- (void)viewWillAppear:(BOOL)animated
- (void)viewDidAppear:(BOOL)animated
- (void)viewWillDisappear:(BOOL)animated
- (void)viewDidDisappear:(BOOL)animated  
```

There are other methods meant for memory management, but for know, knowing these methods are good. Most notably `loadView` and `viewDidLoad`. `viewDidLoad` has been most famously referred to as the "init" for view controllers. It's not. Don't get used to it either. And if you ever see anyone using `viewDidLoad` as an initializer, correct them. When creating UI elements and adding those to the view controller's view use `loadView`. It's best practice and ensure all elements being put onto the screen have been initialized and added before the view actually appears.

For our code, we don't implement anything in the view lifecycle methods (though the project will probably be updated to change that). We do, however, make a custom initializer. It's defined as:

``` objc
- (instancetype)init  
{  
    self = [super init];  
    if ( self ) {  
        self.title = @"Starter Kit";  
    }  
    return self;  
}  
```

Lets look at the return type for a second. We specify it as `instancetype`, and if you've ever done iOS development before you've probably seen `id` there instead. So what's the difference? Well, lets briefly talk about how Objective-C resolves object types. If you come across an object of type `id` that means someone (whether it was you or another developer) opted out of type safety for whatever reason and the compiler just doesn't know it's type and resolves it a runtime. Ok, but how does it figure out the type? An instance of type `id` gets figured out via messaging. Essentially, that object will get hit with messages that pertain only to specific object types and once one of those messages returns yes the object type associated with that message gets assigned to that object of type `id`. You may be thinking "wow that's really inefficient...". You're right! It is pretty inefficient. That's why we want to avoid `id` at all costs. With `instancetype`, the compiler will correctly infer the type of the object being created. So upon initialization of the object, the compiler already knows its type. So using `instancetype` as the return value of `init` is optimal. You can read more on the differences between `id` and `instancetype` [here](http://nshipster.com/instancetype/).

Now lets look at the `self = [super init];` line. We need to make sure that every parent initializer is called before our object is initialized. That's what `[super init]` does. We assign that result to `self` since the the result is the default implementation of whatever object you're creating (in this case a `UIViewController`). Then we check to see if that return `nil` with the line `if (self) {...}`. If `self` was initialized successfully, do our custom stuff. That's essentially what we're saying with this if-statement. What we then do is set the `title` attribute to be `@"Starter Kit"` which will be displayed in the top bar. NOTE: The `@` symbol designates a literal. In this case we're making an `NSString` literal. Lastly, we return our customized `self`. Now we have a completely custom view controller! Pretty nifty, huh?

# Putting It All Together

That's pretty much it! When we initialize our view controller in the App Delegate, that custom initializer is called and sets that title for us even before we display the view controller on the screen. This is almost as bare bone as it gets and I'll be adding more to the project and adding more posts to reflect those changes as well. If you have any questions or corrections feel free to contact me! My email is on my website or you can tweet at me!