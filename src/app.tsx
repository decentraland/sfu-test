import React, { useEffect, useState } from 'react'
import { Button, Card, Logo, Label } from 'decentraland-ui'
import { v4 as uuid } from 'uuid'

import styles from './app.module.css'

import 'decentraland-ui/lib/styles.css'
import 'decentraland-ui/lib/dark-theme.css'

import Video from './components/video'
import Signal from './signal'
import { LocalStream, RemoteStream } from 'ion-sdk-js'

const Home: React.FC = () => {
  const [signal, setSignal] = useState<Signal>()
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([])
  const [localStream, setLocalStream] = useState<LocalStream>()

  useEffect(
    () => {
      const signal = new Signal('wss://sfu.decentraland.services/ws', uuid())
      signal.joinRoom('boedo')
      signal._on('remoteStreams', setRemoteStreams)
      setSignal(signal)
    },
    [],
  )

  const onBroadcastClick = async () => {
    if (!signal) return

    if (signal.localStream) {
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
      <Logo />
      <div className={styles.button}>
        <Button onClick={onBroadcastClick}>
          {!localStream ? 'Start broadcasting' : 'Stop' }
        </Button>
      </div>
      <div className={styles.videoContainer}>
        <Card.Group>
          {localStream && <Video key={localStream.id} value={localStream} muted controls={false} />}
          {remoteStreams.map(stream => <Video value={stream} key={stream.id} />)}
        </Card.Group>
      </div>
    </div>
  )
}

export default Home
