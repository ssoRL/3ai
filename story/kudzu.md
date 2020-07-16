*Kudzu, is a vine native to the temperate regions of Asia. It is a structural parasite, relying on trees to reach favorable sunlit positions. However, once it is established, it will often smother the trees with its dense growth and weight. Left unchecked, Kudzu can grow faster than almost any other plant, up to a foot per day in the peak of its season.*

kudzusectionbreak

It started when Jeff and I were hanging out one day. I was playing video games while he was clicking around reddit or something. Suddenly he looks up and says, “God. Like, 99% of everything that gets upvoted is total shit. It's like what you'd get if you trained a neural network on last weeks memes and whatever's trending on twitter.”

I said, “Yeah.”

He kept going, “Actually, that'd probably be better. Like, what is this shit.”

I asked, “So why don't you do it then?”

“Do what?”

“Train a bot on last week's memes and twitter and sees what happens.”

“I dunno. Sounds hard.”

I put down the controller. “I'll help. This game sucks anyway.”

kudzusectionbreak

It turned out it was hard to get enough data. We hacked together a scrapper that got us plenty of content, but it was all an unlabeled mess that wouldn't neatly cluster. I tried training a GAN on image macros, but the end result was more surreal than amusing. We got bored and gave up around 7. I think Jeff more or less forgot about it then, but I kept coming back to the problem whenever I had some free time.

Eventually I gave up on memes. The constantly changing formats and in-jokes proved hard for a neural net. As soon as I thought I could get a handle on some variant, it was stale and the models I'd built didn't generalize to the fresh new thing.

But then, one day I had to go to Facebook for some reason. I think my mom posted something on my wall and then emailed me telling me to check it out, then texted me telling me to check my email. Anyway, I got scrolling around, trying to find the post my mom wanted me to look at, when I started to notice the sort of articles and stuff that people were sharing. And holy shit was it ever vapid. And repetitive. And formulaic. And perfect for my neural net.

A couple hours later and I had it. My very own clickbait bullshit generator.

kudzusectionbreak

I showed it to Jeff that weekend. He clicked thru a few of the examples it had generated and smirked, “Well, glad this came to something. How's it work?”

“It's an adversarial network like I'd been trying on the memes. This data's easier to work with though. I used social engagement as a proxy for quality and some standard pre-trained text generation and parsing neural nets.”

He laughed at one of the articles headlines, *She Gave Her Dog to a Homeless Man and You'll Never Believe What Happens Next!* After reading the first few sentences he said, “Huh, this almost sounds like it was written by a human.”

“I guess. Assuming a human under tight deadlines and without a particularly firm grasp of the english language.”

“I'm mean, so that's like 50% of everything online.”

“True.”

After looking at a few more articles he asked, “You planning on doing anything with this?”

“No. I mean, like what? It's sort of funny but it's total shit.”

“Not really sure. Mind if I fork the code?”

“Go for it. I'll send you the training data too. Save you some scraping.”

kudzusectionbreak

The next I heard from Jeff was a month later. He sent me a text. It was just a link and the message, *check this out.*

I did. It was an article on a site I had never heard of before. I read a few sentences before realizing what it was. I texted Jeff back, *that's from my algorithm*

*yeah i made it with code u gave me*

*why?*

He sent me another link. This time to the Google Analytics page for the site. The stats looked good. A moment later he followed up, *people love this shit*

I asked, *what's your plan?*

*monetize. u in?*

kudzusectionbreak

We met up over coffee the next day. Jeff was excited, “There's so much potential here. People come. They read the shit your algorithm spits out. They click thru to the next article. They share this shit on Facebook.”

“OK, cool. But do you really think we could make a business around that?”

“Yeah sure. I mean, I figure there's lots of shit media companies out there. But unlike them, we don't have to pay any writers. Just need to buy some server time for the shit-bot.”

“The shit-bot?”

“Yeah. That's what I've taken to calling it. No offense, like the tech's cool, but...”

“It just writes a lot of shit. Yeah, I know. That was the whole point.”

“But anyway, shit-bot is really working out. It made the money I'm buying this coffee with.”

“How?”

“Ad revenue. Obviously.”

“Fair. So what do you need me for anyway? Sounds like you've got everything hooked up.”

“Yeah, but right now it really sucks. Like gets some click-thru, but only with total idiots, or like people who only read the headline or something. But what if shit-bot was just a little better? I think this could really take off. And you're the data-science genius here. You think you could make it better?”

“I mean, probably. If we could buy more compute. Scrape some more data. I guess if you have analytics up we could use that too. But, like, there's mid-terms coming up. And...”

“So what. Over the last week this site made $20 on $5 in hosting fees. Those are small numbers, yeah, but it's still like a 4 times return on investment. Aren't you a little interested where that goes?”

“I don't know. Let me get back to you.”

kudzusectionbreak

Turned out I was interested. That night I tried to study a bit, but then I got to thinking about the shit-bot. Figuring out how to make it better. Soon I was back to coding on it, and soon after that, the sun was coming up.

I slept thru my classes, woke up early afternoon, and got back to work on the shit-bot. By 9, I had it where I wanted it. It was still shitty. Everything it wrote was hysterical and derivative, but the sentence structure was a bit less of an obvious word soup, and I hooked it up to Jeff's analytics so it could keep honing in on whatever was trending.

I texted Jeff, *Hey man, think I got a V2 for you*

*So, ur in?*

*Yeah I'm in*

kudzusectionbreak

Things went fast after that. We were each working fourteen, sixteen hour days. Me hacking away, and Jeff promoting us thru every channel he could find. It turned out his original estimate for what our profits would be like had been a bit inflated. Still, for every dollar we spent on hosting and training the nets, we were easily getting a dollar and a half out.

Soon I had dozens of shit-bots, each with a distinct voice. Some dopey and feel good, other's fiery and partisan, a few trying to seem reasonable and staid. We set up a whole network of sites all pointing at each other.

Pretty soon Jeff had set up a system to automate even that. It would register a domain name, create the home page, and select a slate of shit-bots to write for it. I pulled viewership data and fed it back to the shit-bots, teaching them what people liked, what they should sound like.

Things slowed down a bit. There were a few moving parts we had to keep attending to: updating the scrapers when their target sites changed format, trying out new processing layers when the inspiration struck. But for the most part, the system kept itself growing. As long as we fed it enough money to buy hosting time for the sites and the bots, and a bit for adverts, it kept growing. Getting better. Getting bigger.

kudzusectionbreak

With not a lot else to do, I decided to make a plug-in just for fun. It pulled all the domains we owned and would highlight any link to them. I browsed a few minutes and it was disconcerting. A full 20% of what I saw was highlighted. Owned by us.

I asked Jeff, “Doesn't it seem weird that this is all us. Like there's this right wing nut site, and then this guy is posting a rebuttal from some lefty blog, but they're both us, but neither of us even knew they existed 'till now.”

Jeff shrugged, “I think it's pretty cool. Like maybe this is future of journalism, right.”

I clicked on one of the articles and read it, “But it's still shit-bot.”

“What do you mean?”

“It still just seems like it's mashing up other people's templates. Nothing's original.”

“But it's profitable as hell. Last month we pulled in 100k. You complaining about that?”

“No. I just said it seemed a bit weird.”

kudzusectionbreak

For a while we just sort of coasted. We bought some cars. Rented out a sweet house with a swimming pool and tiki bar. I think Jeff must have thrown a party just about every night for a month.

Our constellation of sites kept growing.

kudzusectionbreak

Then, one day I got a message from Jeff, *u seen this?*

It was an article in the Times. I opened it and it was immediately clear why Jeff had sent it. They had figured us out. There was a mostly complete list of the sites we had registered, a pretty good guess at our methodology, and a blistering editorial using phrases like, *irresponsible cash-grab*, and *the destruction of news media as we know it*.

Jeff and I spent several hours panicking. Setting up new VMs, new shit-bots, new shell corporations. We both thought that the game was up, that we were going to be the victims of the next digital witch-hunt. But then, to use one of the favorite phrases of our V0 product: *You'll Never BELIEVE What Happens Next!*

People began sharing the Times article. Commenting on it. Pushing it to the number one slot on numerous aggregators. And the shit-bots took note. Within an hour, they were starting to write about the new automated media threat. Within two, they had every possible angle covered. And before I had even finished the auto-incorporation routine, any hope of a rational discussion and targeted action against us was lost amid their wild digital howling.

Not one, but three, of our sites published articles that became more popular than the Times original, decrying themselves. They were basically the same, but with the inimitable shit-bot style. While the original Times piece had been well argued, passionate, and well… original, these brought something more. They were full of the over-the-top rhetoric and calls to action that got blood pumping. And more importantly, that got share buttons clicked.

As well as giving themselves negative press, the shit-bots ran articles claiming that automated media was here and it was going to save humanity. They ran articles claiming that they were technically unfeasible and the original report was a lie. They ran articles claiming they were a tool of the Russian government. The only thing that all the articles had in common with each other, was that all of the money from ad impressions was going to us.

All in all, it turned out to be a pretty good day.

kudzusectionbreak

But things fell apart quickly after that. At first we thought what we needed to fear was a government crackdown. There was talk of passing a law that would require any site with automatically written stories to show disclaimers. Europe looked like they were going to move in that direction in a matter of months.

But what really killed us was the competition. Suddenly everyone realized that shit-bots were possible, and profitable. What had once been a wide open cash grab for us turned into a very crowded field, with us up against some of the biggest tech and media companies on the planet.

It didn't end well. Well funded corporations full of PhDs quickly blew past us technically and expanded from shitty clickbaity articles to nearly all forms of written media, and then, with almost terrifying velocity, into video.

A generation of YouTube stars arose not from random teens in front of cheap cameras, but from Google servers scraping over those videos that got most popular and learning how to copy them. But prettier, flashier, better. Netflix's catalog was soon packed with mostly computer generated scenes of computer generated actors performing computer generated scripts.

We tried to keep up at first. We burned a lot of the money we had made improving our algorithms, buying more server time to crunch more data. We took on venture capital to hire a team of devs to try to catch up. We worked fourteen, sixteen hours a day until invariably Jeff and I would be screaming at each other at three in the morning. Then we'd go home, sleep, and try again the next day.

Finally, I threw in the towel. I told Jeff I'd had enough. I was quitting effective immediately. He scowled at me, “Fine, it's not like you've done anything for this company in the last year anyway.”

That was the last time I talked to him.

kudzusectionbreak

In some ways it was a golden age of content. There was more media generated every second than I could consume in a year. Maybe in a life time. But it all felt empty.

I know that Steve Jobs or Picasso or whoever said that great artists steal, but this was different. This wasn't looking at something, and thinking, that's awesome, I bet I can do it better. This was a bunch of servers that knew how to read metrics on trending content and then remix it to maximally stimulate dopamine release.

There was a recognizable cycle that sprung up. First someone, someone human, would come up with an idea and post it. It was always a bit fun to find that. Some raw creativity still floating around. But then, quickly and surely, the shit-bots would arrive.

They'd re-post and remix, climb up onto the shoulders of the new idea to gather as many eyeballs and as much ad money as they could, before it collapsed under the unbearable weight of overuse.

Without much of anything else to do, I found myself spending a lot of time wandering thru the internet, looking for the humans, looking for the new ideas. Then I'd watch as the countless offspring of my original shit-bot swarmed around them. Smothering them.

It was horrifying, yes. But I couldn't look away.