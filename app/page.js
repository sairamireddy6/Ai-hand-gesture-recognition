"use client"
import React, {useRef, useState} from "react";
import * as tf from "@tensorflow/tfjs"
import * as handpose from "@tensorflow-models/handpose"
import Webcam from "react-webcam";
import { drawHand } from "@/share/utilities";

import * as fp from "fingerpose"
import victory from "../public/victory.png"
import thumbs_up from "../public/thumbs_up.png"

export default function Home() {
  let webCamRef = useRef(null)
  let canvasRef = useRef(null)

  let [emoji, setEmoji] = useState(null)
  const images = {thumbs_up,victory}

  const runHandpose = async ()=>{
    let net = null
    try {
      net = await handpose.load()
    } catch (error) {
      
    }
    console.log("Handpose model loaded");
    setInterval(() => {
      if(net){
        detect(net)
      }
    }, 100);
  }

  const detect = async (net)=>{
    if(webCamRef.current && webCamRef.current.video.readyState === 4){
      const video = webCamRef.current.video
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight

      webCamRef.current.video.width = videoWidth
      webCamRef.current.video.height = videoHeight

      canvasRef.current.width = videoWidth
      canvasRef.current.height = videoHeight

      const hand = await net.estimateHands(video)

      if(hand.length > 0){
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture
        ])

        const gesture = GE.estimate(hand[0].landmarks,8)
        if(gesture.gestures !== undefined && gesture.gestures.length){
          console.log("gesture.gestures",gesture.gestures);
          if(gesture.gestures[0].score >= 9){
            setEmoji(gesture.gestures[0].name)
          }
          console.log("emoji",emoji);
        }
        // console.log(gesture);
      }
      // else{
      //   setEmoji()
      // }

      const ctx = canvasRef.current.getContext("2d")
      drawHand(hand, ctx)
      console.log(hand);
    }
  }

  runHandpose()

  return (
    <div>
      <Webcam ref={webCamRef}
      style={{
        position: "absolute",
        marginLeft:"auto",
        marginRight:"auto",
        left:0,
        right:0,
        textAlign: "center",
        zIndex:9,
        width:640,
        height:480
      }}
      />
      <canvas 
      ref={canvasRef}
      style={{
        position: "absolute",
        marginLeft:"auto",
        marginRight:"auto",
        left:0,
        right:0,
        textAlign: "center",
        zIndex:9,
        width:640,
        height:480
      }}
      />

      {
        emoji !== null && <img src={emoji == "thumbs_up" ? 'thumbs_up.png' : emoji == "victory" ? "victory.png" : ""} style={{
          position: "absolute",
          marginLeft:"auto",
          marginRight:"auto",
          left:400,
          bottom:500,
          right:0,
          textAlign: "center",
          height:100,
          zIndex:9999999
        }}/>
      }
    </div>
  );
}
