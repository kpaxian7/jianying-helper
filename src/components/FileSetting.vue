<template>
  <div class="container">

<!--    <span>字幕颜色批量替换</span>-->
<!--    <span>字幕内容批量替换</span>-->

  </div>
</template>

<script>
export default {
  name: "FileSetting",
  methods: {

    // 触发文件输入
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    // 处理文件选择
    handleFileUpload() {
      const file = this.$refs.fileInput.files[0];
      if (!file) return;

      // 这里添加上传文件的逻辑
      this.uploadFile(file);
    },

    uploadFile(file) {
      console.log(file)

      const reader = new FileReader();
      reader.onload = (e) => {
        console.log(e)
        const json = JSON.parse(e.target.result);
        this.readTexts(json);
      };

      reader.readAsText(file);

      // console.log(file.target.result)
    },

    readTexts(json) {
      const texts = json["materials"]["texts"];
      console.log(texts);
    }
  }
}
</script>

<style scoped>

.container {
  width: 30vw;
  height: 100%;
  background-color: #2c3e50;
  justify-content: start;
  align-items: center;
  display: flex;
  flex-direction: column;
  /*border-radius: 6px;*/
}

.btn-upload {
  margin-top: 30%;
  background: none;
  color: white;
  border: 1px solid white;
  padding: 8px 50px;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.btn-upload:hover {
  background: #333;
  color: #fff;
  border-radius: 0;
}

span{
  color: white;
  width: 80%;
  text-align: start;
  margin-top: 10px;
  font-weight: bold;
  font-size: 16px;
}
</style>