# Lycan

Lycan is a decentralized private message board using the [Onionr](https://onionr.net/) network

It works by communicating with regular Onionr nodes to sync blocks for this application.

It does not require trust in the nodes beyond that at least 1 bootstrap node is not denying service. Messages are validated and rate limited via sha3 computed with a partial collision (proof of work).

In the future, a web of trust system public key system may be used to further reduce spam/abuse and enable verification of posts to the same 'account'.

Posts are immutable and anonymous. Even if the official site is taken down, the code can be ran locally (such as with python -m http.server 8080)

Try it out with Tor Browser at: http://lycanz36ofyrmd2gca47m7kv7m3d2vljsnexzwvu5xsiqsforkumkvyd.onion/
