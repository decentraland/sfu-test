import { Client, Constraints, LocalStream, RemoteStream } from 'ion-sdk-js'
import { IonSFUJSONRPCSignal } from 'ion-sdk-js/lib/signal/json-rpc-impl'
import { EventEmitter } from 'events'

type Options = {
  reconnect: boolean
}

type Events = {
  remoteStreams: RemoteStream[]
  error: Error | Event
  close: Event
}

type Callback<T> = (arg: T) => void

class Signal extends EventEmitter {
  private uri: string
  private signal!: IonSFUJSONRPCSignal
  private client!: Client
  private connected: boolean = false
  private uuid: string
  reconnect: boolean
  cbQueue: (() => void)[] = []
  remoteStreams: RemoteStream[] = []
  localStream: LocalStream | undefined

  constructor(uri: string, uuid: string, opts?: Options) {
    super()
    this.uri = uri
    this.uuid = uuid
    this.reconnect = opts?.reconnect || true

    this.connect()
  }

  connect() {
    this.signal = new IonSFUJSONRPCSignal(this.uri)
    this.client = new Client(this.signal)

    this.signal.onclose = (err) => this.handleClose(err)
    this.signal.onerror = (event) => this.handleError(event)
    this.signal.onopen = () => this.handleOnOpen()
    this.handleTracks()
  }

  handleClose(event: Event) {
    console.log('handleClose', event)
    this._emit('close', event)
    // Todo handle reconnect with some better algorithm
    // but for now its ok.
    if (this.reconnect) {
      setTimeout(() => this.connect(), 1000);
    }
  }

  handleError(error: Error | Event) {
    console.log('handleError', error)
    this._emit('error', error)
  }

  handleOnOpen() {
    console.log('connected')
    this.connected = true
    this.cbQueue.forEach(promise => promise())
  }

  async joinRoom(sid: string) {
    if (!this.connected) {
      this.cbQueue.push(() => this.joinRoom(sid))
      return
    }

    try {
      await this.client.join(sid, this.uuid)

      console.log('joined room: ', sid)
    } catch(e) {
      this.handleError(e as Error)
    }
  }

  async publish(opts?: Partial<Constraints>) {
    this.localStream = await LocalStream.getUserMedia({
      resolution: 'hd',
      audio: true,
      codec: 'vp8',
      video: false,
      simulcast: true,
      ...opts,
    })

    this.client.publish(this.localStream)
    return this.localStream
  }

  unPublish() {
    if (this.localStream) {
      this.localStream.unpublish()
    }
  }

  _on<T extends keyof Events>(key: T, cb: Callback<Events[T]>) {
    this.on(key, cb)
  }

  _emit<T extends keyof Events>(key: T, value: Events[T]) {
    this.emit(key, value)
  }

  handleTracks() {
    console.log('handle-tracks', this.client)

    this.client.ontrack = (track, stream) => {
      console.log({ track, stream })
      track.onunmute = () => {
        const remoteStream = this.remoteStreams.find(r => r.id === stream.id)
        if (!remoteStream) {
          // Add remote stream to array
          this.remoteStreams = this.remoteStreams.concat(stream)
          this._emit('remoteStreams', this.remoteStreams)

          // Find and remove remote stream
          stream.onremovetrack = () => {
            this.remoteStreams = this.remoteStreams.filter(s => s.id !== stream.id)
            this._emit('remoteStreams', this.remoteStreams)
          }

        }
      }
    }
  }

}

export default Signal