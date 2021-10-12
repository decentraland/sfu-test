import { startVoice, joinRoom } from '@dcl/voice/dist/actions'
import { LocalStream, RemoteStream } from 'ion-sdk-js'

export type Props = {
  connected: boolean
  localStream?: LocalStream
  remoteStreams: RemoteStream[]
  onStartVoice: typeof startVoice
  onJoinRoom: typeof joinRoom
}

export type MapStateProps = Pick<
  Props,
  | 'connected'
  | 'localStream'
  | 'remoteStreams'
>

export type MapDispatchProps = Pick<Props, 'onStartVoice' | 'onJoinRoom'>
