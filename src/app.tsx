import React from 'react'
import { IonSFUJSONRPCSignal } from 'ion-sdk-js/lib/signal/json-rpc-impl'
import { Client, LocalStream, RemoteStream } from 'ion-sdk-js'
import { Button, Card, Logo } from 'decentraland-ui'

import styles from './app.module.css'

import 'decentraland-ui/lib/styles.css'
import 'decentraland-ui/lib/dark-theme.css'

import { useEffect, useState } from 'react'
import Video from './components/video'


const Home: React.FC = () => {
  const [client, setClient] = useState<Client>()
  const [localStream, setMedia] = useState<LocalStream>()
  const [
    remoteStreams,
    setRemoteStreams,
  ] = useState<RemoteStream[]>([])

  useEffect(
    () => {
      const config: Client['config'] = { codec: 'vp8', iceServers: [{ urls: "stun:stun.l.google.com:19302" }]};
      const signal = new IonSFUJSONRPCSignal('wss://f807-2800-810-503-618-1479-c59f-730f-8a92.ngrok.io/ws')
      const client = new Client(signal, config)

      setClient(client)

      // Connect to channel
      signal.onopen = () => client.join('test session', `username-${Date.now()}`)

      // "Handle" Errors
      signal.onerror = (error: unknown) => console.log({ error })

      // Subscribe to stream events
    },
    [],
  )

  useEffect(
    () => {
      if (!client) return

      client.ontrack = (track, stream) => {
        track.onunmute = () => {
          const remoteStream = remoteStreams.find(r => r.id === stream.id)
          if (!remoteStream) {
            console.log({ track: track.id, stream: stream.id })
            // Add remote stream to array
            setRemoteStreams(remoteStreams.concat(stream))

            // Find and remove remote stream
            stream.onremovetrack = () => {
              setRemoteStreams(remoteStreams.filter(s => s.id === stream.id))
            }
          }
        }
      }
    },
    [client, setRemoteStreams, remoteStreams]
  )

  const onBroadcastClick = async () => {
    if (localStream) {
      localStream?.unpublish()
      setMedia(undefined)
      return
    }
    try {
      const localStream = await LocalStream.getUserMedia({
        resolution: 'hd',
        simulcast: true,
        audio: true,
        codec: 'vp8'
      })
      setMedia(localStream)
      client?.publish(localStream)
    } catch (e) {
      console.log({ e })
    }
  };

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
          {localStream && <Video key={localStream.id} value={localStream} />}
          {remoteStreams.map(stream => <Video value={stream} key={stream.id} />)}
        </Card.Group>
      </div>
    </div>
  )
}

export default Home
