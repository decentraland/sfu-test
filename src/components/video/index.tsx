import React, { useEffect, useRef } from 'react'
import { LocalStream, RemoteStream } from 'ion-sdk-js'
import { Card } from 'decentraland-ui'

import styles from './video.module.css'


type Props = {
  value: LocalStream | RemoteStream
}

const Video: React.FC<Props> = ({ value }) => {
  useEffect(
    () => {
      if (!refVideo.current) return
      refVideo.current.srcObject = value
    },
    [value]
  )
  const refVideo = useRef<HTMLVideoElement>(null)
  return (
    <Card>
      <Card.Content>
        <Card.Header>
          {value.id}
        </Card.Header>
        <Card.Meta>
          <video className={styles.video} ref={refVideo} autoPlay controls />
        </Card.Meta>
      </Card.Content>
    </Card>
  )
}

export default Video
