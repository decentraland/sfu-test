import React, { useEffect, useState } from 'react'
import { Button, Card, Logo, Label } from 'decentraland-ui'
import { v4 as uuid } from 'uuid'

import styles from './app.module.css'

import 'decentraland-ui/lib/styles.css'
import 'decentraland-ui/lib/dark-theme.css'

import Video from './components/video'
import Signal from './signal'
import { LocalStream, RemoteStream } from 'ion-sdk-js'

const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

const Home: React.FC = () => {
  const [signal, setSignal] = useState<Signal>()
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([])
  const [localStream, setLocalStream] = useState<LocalStream>()

  useEffect(
    () => {
      const signal = new Signal('wss://test-sfu.decentraland.zone/ws', uuid())
      setSignal(signal)
      signal._on('remoteStreams', setRemoteStreams)
      signal._on('connected', () => signal.joinRoom('boedo'))
      signal._on('close', () => setLocalStream(undefined))
    },
    [],
  )

  const onClickLogo = () => {
    if (!remoteStreams.length) return

    const ctx = new AudioContext()
    const gainNode = ctx.createGain()

    remoteStreams.forEach(stream => {
      // HACK for chrome
      // If we dont fake this new Audio then there is no sound being played.
      const audio = new Audio()
      audio.muted = true
      audio.srcObject = stream
      // END of hack

      const track = ctx.createMediaStreamSource(stream)
      track.connect(gainNode)
    })

    gainNode.connect(ctx.destination)
    gainNode.gain.value = .5
  }


  const onBroadcastClick = async (reconnect?: boolean) => {
    if (!signal) return

    if (signal.getLocalStream()) {
      return signal.unPublish()
    }

    const localStream = await signal.publish()
    setLocalStream(localStream)
  };

  if (!signal) {
    return <div><Label>Connecting</Label></div>
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Welcome to <a href="https://decentraland.org">Decentraland ZooMeets!</a>
      </h1>
      <div onClick={onClickLogo}><Logo /></div>
      <div className={styles.button}>
        <Button onClick={() => onBroadcastClick()}>
          {!localStream ? 'Start broadcasting' : 'Stop' }
        </Button>
      </div>
      <div className={styles.videoContainer}>
        <Card.Group>
          {/* {localStream && <Video key={localStream.id} value={localStream} muted controls={false} />} */}
          {/* {remoteStreams.map(stream => <Video value={stream} key={stream.id} />)} */}
        </Card.Group>
      </div>
    </div>
  )
}

export default Home
