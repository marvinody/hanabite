# [Hanabite](https://hanabite.deploy.sadpanda.moe/)
Hanabi in Svelte

## Dev
- fork and clone
- `npm install`
- `npm run dev`
- work away

Directory of importance: `src/`

## Why?
A project undertaken to learn Svelte and get more comfortable with sockets. Main technologies in use are Svelte & Sapper, polka, and SocketIO. When learning new tech, I try to limit my use of external libraries so I'm forced to use whatever is given.

## What I wanted?
My goal going into this was to have a playable version of Hanabi with online multiplayer, realtime updates, spectator viewing, a lobby system to handle multiple rooms, and AI players.

## What I got?
AI turned out to be way too much work for the span I wanted to complete this in so I ended up tossing it to the side. I was able to reuse some logic from a previous project (cubestory) and massage it a bit to make it more generic.

## What I learned?
While working on this, I had some...interesting...interactions with font awesome because the \<i> tags get changed to svg or something else which then svelte doesn't keep track of. So I initally assigned classes to icons and my code was throwing errors anytime it tried to change them. Let me tell you the error code was not helpful at all though. Browser debugger let me pause on exceptions and find out which component was throwing errors and I was able to go from there, but man, not nice.

Having the power to have some redux-like single source of truth natively through Svelte's store is something I will miss if I go back to plain React. The ability to create your own store is something I took advantages of to distinguish between empty and unloaded everywhere in the application. Had I the chance to go back in time and tell myself something before starting, it would be to make sure I was abusing the store instead of using props passed down. It might be less efficient, but it's definitely simpler to know where data is and if you have it. I would also probably look for some redux-like library to have a pure functional reducer for updating state (or make my own).

## What's next?
If I were to continue working on this project, the next steps (in no particular order) would be to work on getting AI to not be dumb, allowing people to tell other players stuff like "these 3 cards are NOT yellow." The code can support negations but I was unsure of how to display it in a visually pleasing way so I dropped it (how do you show a card can be 1,2,5 but not 3,4?). Also, making it mobile-ok and having responsive cards would be a good starting point. I spent a significant amount of time researching responsive aspect ratio things but none could satisfy my requirements in a simple way. If I go back, I may use JavaScript to dynamically change the height that way instead of relying on CSS.
