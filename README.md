Schbot
=============

Uses [PotIRCl](https://github.com/potasmic/PotIRCl)

## Install
```shell
$ git clone [URI to this repo]
```

## Run
```shell
$ nodejs index -n IRCNick -s foo.irc.net -e exec.json
```

## Commands in this repo
```
!cum [tags] | [filter] | [scoresAbove]:
	This command queries Gelbooru to find images that has the [tags] specified, [filter]s out any images with such word in their tags, and scores above [scoreAbove].
	For example,
		!cum 1boy, tree | grass | 100
			Find a random image that has 1boy and tree tag, filters out images which has tags containing 'grass' (grass, tallgrass, grasses, etc.), and scores above 100.
		!cum | bed
			Find a random image which doesn't have 'bed' in its tags.
		!cum || 140
			Find a random image scoring above 140.
	!cum has a fallback `inazuma_eleven` tag if no tags are specified. It also has some tags filtered by default. (See ./scripts/gelbooru.js)

!fur [tags] | [filter] | [scoresAbove]: Same as above. No tags or filters are added by default, i.e.: completely organic.

!shota [tags] | [filter] | [scoresAbove]: Same as above. No tags or filters are added by default, i.e.: completely organic.

!define [wordPhrase]: Find a definition from Urban Dictionary (Mashape API).

!uinfo [username/nick]: Fetch discord user's info

!avatar [username/nick]: Fetch avatar URL

!wiki [query]: Returns the first sentence of a Wikipedia article. (Uses Wikipedia API).

!d [query]: Returns the definitions and pronunciation from Merriam-Webster (Uses Merriam-Webster API).

!shiba : Returns a picture URL from @shibesbot on Twitter.

!? [query]: Returns the result from Wolfram Alpha (Using W|A API)

!imdb [query]: Returns the movie title, description, rating, etc. from OMDB. Additionally, you can do: !imdb [SeriesName] Season [x] Episode [y].

!help: Returns a list of (hopefully all) commands.

!source: Returns the this page's URL.

!roll [num]: Returns a random number from 0-num

!choose [w1], [w2], ..., [w-n]: Returns one item from a list of items. (Unstable)

!genkey [-t characters] [-l length]: Generate a random string. Default to 32-character alpha-numeric and symbols.

Other miscellaneous commands:
!hansen
```