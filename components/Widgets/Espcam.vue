<template>
  <card>
    <div slot="header">
      <h5 class="pull-right">{{ frameRate.toFixed(1) }} Frames/s</h5>
      <h4 class="card-title">
        {{ config.selectedDevice.name }} - {{ config.cameraName }}
      </h4>
    </div>
    <img style="width:100%; height: 331px" :src="imageUrl" />
  </card>
</template>

<script>
export default {
  props: ["config"],
  data() {
    return {
      frameRate: 0,
      timeBetweenFrames: 0,
      previousFrameTime: 0,
      ws: null,
      imageUrl:
        "https://www.history.com/.image/t_share/MTY3MDI2OTM0ODU1NzcxNTQx/us-navy-ufos.jpg"
    };
  },
  mounted() {
    this.startCam();
    this.prevFrameTime = Date.now();
  },
  methods: {
    startCam() {
      var WS_URL = "";
      if (process.env.environment == "prod") {
        WS_URL = "wss://demo.ioticos.org:65080";
      } else {
        WS_URL = "ws://192.168.0.6:65080";
      }

      this.ws = new WebSocket(WS_URL);
      let urlObject_1, urlObject_2, urlObject_3;

      this.ws.onopen = () => {
        this.ws.send("WEB_CLIENT");
      };

      this.ws.onmessage = async message => {
        this.timeBetweenFrames = Date.now() - this.previousFrameTime;
        this.previousFrameTime = Date.now();
        this.frameRate = 1000 / this.timeBetweenFrames;

        var blobObj = new Blob([message.data]);
        const buf = await blobObj.arrayBuffer();

        var uint8 = new Uint8Array(buf.slice(12));
        var currentCam = uint8[0];
        var currentCam2 = uint8[1];

        var binaryType = this.ws.binaryType;

        if (currentCam == 0x1) {
          urlObject_1 = URL.createObjectURL(blobObj);
          this.imageUrl = urlObject_1;
        }
      };
    }
  }
};
</script>
