// @flow strict

import { future } from "../@reflex/Future.js"

/*::
import type { Decoder } from "../Decoder.flow/Decoder.js"

declare class BroadcastChannel {
  name:string;
  addEventListener("message", {handleEvent(MessageEvent):void}):void;
  removeEventListener("message", {handleEvent(MessageEvent):void}):void;
  constructor(string):void;
  postMessage(any):void;
  close():void;
}

export type OutgoingMessage = {
  data:mixed;
  transfer:?(mixed[]);
}

export opaque type Channel<inn, out> = MessageChannel<inn, out>

export interface Inbox<message> {
  receive():Promise<message>
}

export interface Outbox<message> {
  send(message):void
}

export interface Mailbox<inn, out> extends Inbox<inn>, Outbox<out> {
  +inbox:Inbox<inn>;
  +outbox:Outbox<out>;
}

*/

class MessageChannel /*::<inn, out>*/ {
  /*::
  readQueue:{resolve:inn => void }[]
  lastMessage:?inn
  decoder:Decoder<mixed, inn>
  encoder:Decoder<out, OutgoingMessage>
  outbox:Outbox<out>;
  +post:(mixed, ?mixed[]) => void;
  */
  constructor(
    decoder /*:Decoder<mixed, inn>*/,
    encoder /*:Decoder<out, OutgoingMessage>*/
  ) {
    this.readQueue = []
    this.lastMessage = null
    this.decoder = decoder
    this.encoder = encoder
  }
  get inbox() /*:Inbox<inn>*/ {
    return this
  }
  get outbox() /*:Outbox<out>*/ {
    return this
  }
  handleEvent(event /*:MessageEvent*/) {
    const message = this.decoder.decode(event.data)
    if (message instanceof Error) {
      console.warn("Was unable to decode incoming message", event)
    } else {
      const receiver = this.readQueue.shift()
      if (receiver) {
        receiver.resolve(message)
      } else {
        this.lastMessage = message
      }
    }
  }
  send(message /*:out*/) {
    const result = this.encoder.decode(message)
    if (result instanceof Error) {
      console.warn("Was unable to encode outgoing message", message)
    } else {
      this.post(result.data, result.transfer)
    }
  }
  receive() /*:Promise<inn>*/ {
    if (this.lastMessage != null) {
      const message = this.lastMessage
      this.lastMessage = null
      if (message) {
        return Promise.resolve(message)
      }
    }

    return new Promise((resolve, reject) => {
      this.readQueue.push({ resolve, reject })
    })
  }
}

class BroadcastMessageChannel /*::<inn, out>*/ extends MessageChannel /*::<inn, out>*/ {
  /*::
  channel:BroadcastChannel
  */
  constructor(
    address /*:string*/,
    decoder /*:Decoder<mixed, inn>*/,
    encoder /*:Decoder<out, OutgoingMessage>*/
  ) {
    super(decoder, encoder)
    this.channel = new BroadcastChannel(address)
    this.channel.addEventListener("message", this)
  }
}

class TopMessageChannel /*::<inn, out>*/ extends MessageChannel /*::<inn, out>*/ {
  constructor(
    decoder /*:Decoder<mixed, inn>*/,
    encoder /*:Decoder<out, OutgoingMessage>*/
  ) {
    super(decoder, encoder)
    window.addEventListener("message", this)
  }
  post(data, transfer) {
    if (window.top !== window) {
      window.top.postMessage(data, "*", transfer)
    }
  }
}

export const receive = future(
  /*::<a>*/ (port /*:Inbox<a>*/) /*:Promise<a>*/ => port.receive()
)

export const send = future(
  /*::<a>*/ (port /*:Outbox<a>*/, message /*:a*/) /*:void*/ =>
    port.send(message)
)

export const mailbox = /*::<inn, out>*/ (
  decoder /*:Decoder<mixed, inn>*/,
  encoder /*:Decoder<out, OutgoingMessage>*/,
  address /*:?string*/ = null
) /*:Mailbox<inn, out>*/ =>
  address
    ? new BroadcastMessageChannel(address, decoder, encoder)
    : new TopMessageChannel(decoder, encoder)
