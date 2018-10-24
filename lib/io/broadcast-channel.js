// @flow strict

import { future } from "../@reflex/Future.js"
/*::
type Decoder <a> = mixed => ?a

declare class BroadcastChannel {
  name:string;
  addEventListener("message", {handleEvent(MessageEvent):void}):void;
  removeEventListener("message", {handleEvent(MessageEvent):void}):void;
  constructor(string):void;
  postMessage(any):void;
  close():void;
}
*/

const channels /*:{[string]:Channel}*/ = {}

export class Channel {
  static async receive(address /*:string*/) /*:Promise<mixed>*/ {
    const channel = Channel.channel(address)
    return channel.receive()
  }
  static send /*::<a>*/(address /*:string*/, message /*:a*/) /*:void*/ {
    const channel = Channel.channel(address)
    return channel.send(message)
  }
  static channel(address /*:string*/) /*:Channel*/ {
    const channel = channels[address]
    if (channel) {
      return channel
    } else {
      const channel = new Channel(address)
      channels[address] = channel
      return channel
    }
  }

  /*::
  broadcastChannel:BroadcastChannel
  readQueue:{resolve:mixed => void }[]
  lastMessage:?MessageEvent
  */
  constructor(address /*:string*/) {
    this.broadcastChannel = new BroadcastChannel(address)
    this.readQueue = []
    this.lastMessage = null
    this.broadcastChannel.addEventListener("message", this)
  }
  handleEvent(event /*:MessageEvent*/) {
    const receiver = this.readQueue.shift()
    if (receiver) {
      receiver.resolve(event.data)
    } else {
      this.lastMessage = event
    }
  }
  send(message /*:mixed*/) {
    this.broadcastChannel.postMessage(message)
  }
  receive() /*:Promise<mixed>*/ {
    if (this.lastMessage != null) {
      const value = this.lastMessage.data
      this.lastMessage = null
      if (value) {
        return Promise.resolve(value)
      }
    }

    return new Promise((resolve, reject) => {
      this.readQueue.push({ resolve, reject })
    })
  }
}

export const receive = future(Channel.receive)
export const send = future(Channel.send)
