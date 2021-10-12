import React, { useEffect } from 'react'
import { Button, Card, Logo, Label } from 'decentraland-ui'

import styles from './App.module.css'
import { Props } from './App.types'

const App: React.FC<Props> = ({
  onJoinRoom,
  onStartVoice,
  remoteStreams,
  localStream,
  connected,
}: Props) => {
  useEffect(
    () => {
      onStartVoice({ url: 'wss://test-sfu.decentraland.zone/ws' })
    },
    [onStartVoice],
  )

  useEffect(
    () => {
      if (connected) {
        onJoinRoom('boedo', 'asd' + Math.random())
      }
    },
    [connected, onJoinRoom]
  )

  const onBroadcastClick = async (reconnect?: boolean) => {
  };

  if (!connected) {
    return <div><Label>Connecting</Label></div>
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Welcome to <a href="https://decentraland.org">Decentraland ZooMeets!</a>
      </h1>
      <div><Logo /></div>
      <div className={styles.button}>
        <Button onClick={() => onBroadcastClick()}>
          {!localStream ? 'Start broadcasting' : 'Stop' }
        </Button>
      </div>
      <div className={styles.videoContainer}>
        <Card.Group>
          {remoteStreams.map(stream => (
            <Card key={stream.id}>
              <Card.Content>
                {stream.id}
              </Card.Content>
            </Card>
          ))}
        </Card.Group>
      </div>
    </div>
  )
}

export default App
