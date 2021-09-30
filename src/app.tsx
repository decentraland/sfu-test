import React from 'react'
import { IonSFUJSONRPCSignal } from 'ion-sdk-js/lib/signal/json-rpc-impl'
import { Client, LocalStream, RemoteStream } from 'ion-sdk-js'
import { Button, Card, Logo } from 'decentraland-ui'
import { v4 as uuid } from 'uuid'

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
      // const signal = new IonSFUJSONRPCSignal('ws://localhost:7000/ws')
      const signal = new IonSFUJSONRPCSignal('wss://sfu.decentraland.services/ws')
      const client = new Client(signal)

      // Connect to channel
      signal.onopen = async () => {
        setClient(client)
        console.log('connecting to boedo')
        try {
          await client.join('boedo', uuid())
        } catch(e) {
          console.log({ e })
        }
        console.log('connected')
      }

      // "Handle" Errors
      signal.onerror = (error: unknown) => console.log({ error })

      // Subscribe to stream events
    },
    [],
  )

  useEffect(
    () => {
      if (!client) return
      // client.ondatachannel = ({ channel }) => {
      //   channel.onmessage = ({ data }) => {
      //     console.log(data)
      //   }
      // }
      // const dataChanel = client.createDataChannel('data')
      // dataChanel.send('hola - soy - random')
      client.ontrack = (track, stream) => {
        console.log('track, stream')
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
        audio: true,
        codec: 'vp8',
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
          {localStream && <Video key={localStream.id} value={localStream} muted controls={false} />}
          {remoteStreams.map(stream => <Video value={stream} key={stream.id} />)}
        </Card.Group>
      </div>
    </div>
  )
}

export default Home
