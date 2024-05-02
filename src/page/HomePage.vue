<template>
  <!--  <button>Upload a file...</button>-->
  <div class="page-container">
    <div class="container-left">
      <!--      <span style="font-size: 80px; color: white;-webkit-text-stroke: 3px blue; font-weight: bold">一二三</span>-->
      <button class="btn-upload" @click="triggerFileInput">Upload</button>
      <!-- 隐藏的文件输入元素 -->
      <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none;"/>

      <div class="color-module-corner_bg" v-if="fileRawJson">
        <div class="input-setting-container">
          <input type="text" class="input-replace-setting" placeholder="请输入要更改的字幕内容" v-model="searchKey">
          <span style="color: white;font-size: 12px;margin-left: 10px;padding: 0; cursor: pointer" @click="searchTexts">搜索</span>
        </div>
      </div>

      <div class="color-module-corner_bg" v-if="matchingTexts.length > 0">
        <span style="color: white;font-size: 14px;font-weight: bold;margin-bottom: 10px">匹配到{{
            matchingTexts.length
          }}条字幕</span>
        <div style="overflow: auto;height: 100px;width: 100%">
          <div class="span-matching-text" v-for="matchingText in matchingTexts" :key="matchingText">{{
              matchingText.text
            }}
          </div>
        </div>
      </div>

      <div class="color-module-corner_bg" v-if="matchingTexts.length > 0">
        <span style="color: white;font-size: 14px;font-weight: bold; margin-bottom: 10px">文字&描边颜色替换</span>

        <div class="container-setting-item">
          <div style="color: white;font-size: 13px">文字颜色：</div>
          <div style="flex: 1"></div>
          <div style="color: white;font-size: 13px">{{ foregroundColor }}</div>
          <color-picker v-model:value="foregroundColor"></color-picker>
        </div>

        <div class="container-setting-item">
          <div style="color: white;font-size: 13px">描边颜色：</div>
          <div style="flex: 1"></div>
          <div style="color: white;font-size: 13px">{{ strokeColor }}</div>
          <color-picker v-model:value="strokeColor"></color-picker>
        </div>

        <div class="btn-apply-color-replace" @click="colorReplaceApplyClick">
          <p style="color: #2c2c2c;font-size: 13px;font-weight: bold">应用</p>
        </div>

      </div>

      <div class="btn-download" v-if="fileRawJson" @click="downloadFile">
        <img src="/images/icon_download.png" style="height: 16px;width: 16px">
        <span style="font-size: 12px">下载</span>
      </div>

    </div>

    <div class="container-right" v-if="fileTexts.length > 0">
      <div class="texts-container">
        <div class="texts-item-container" v-for="item in fileTexts" :key="item">
          <span v-for="subItem in item.subTexts" :key="subItem"
                :style="{color:subItem.color,WebkitTextStrokeWidth:subItem.strokeWidth,WebkitTextStrokeColor:subItem.strokeColor,fontSize:'30px',fontWeight:'bold' }">{{
              subItem.text
            }}</span>
        </div>
        <!--        <span id="span-text-item" v-for="item in fileTexts" :key="item" style="display: block">{{ item.desc }}</span>-->
      </div>
    </div>
  </div>
</template>

<script>
// 导入组件
import ColorPicker from 'vue-pick-colors';
import VsToast from '@vuesimple/vs-toast';
import {
  assembleTextArrModel,
  searchTextsByContains,
  applySpecificColorToRawJson
} from "@/handler/config_editing";

export default {
  name: "HomePage",
  components: {ColorPicker},
  data() {
    return {
      fileName: "",
      fileRawJson: null,
      fileTexts: [],
      matchingTexts: [],
      searchKey: "",
      targetTextsNum: -1,
      foregroundColor: '#FFFFFF',
      strokeColor: '#FFFFFF',

      // testString: '{"canvas_config":{"height":1080,"ratio":"original","width":1920},"color_space":0,"config":{"adjust_max_index":1,"attachment_info":[],"combination_max_index":1,"export_range":null,"extract_audio_last_index":1,"lyrics_recognition_id":"","lyrics_sync":true,"lyrics_taskinfo":[],"maintrack_adsorb":true,"material_save_mode":0,"multi_language_current":"none","multi_language_list":[],"multi_language_main":"none","multi_language_mode":"none","original_sound_last_index":1,"record_audio_last_index":1,"sticker_max_index":1,"subtitle_recognition_id":"","subtitle_sync":true,"subtitle_taskinfo":[],"system_font_list":[],"video_mute":false,"zoom_info_params":null},"cover":null,"create_time":0,"duration":242600000,"extra_info":null,"fps":30.0,"free_render_index_mode_on":false,"group_container":null,"id":"EFEED1FA-D437-4D3C-800F-7DA95279DBE0","keyframe_graph_list":[],"keyframes":{"adjusts":[],"audios":[],"effects":[],"filters":[],"handwrites":[],"stickers":[],"texts":[],"videos":[]},"last_modified_platform":{"app_id":3704,"app_source":"lv","app_version":"5.7.0","device_id":"b38354c3039b562f711f68b5cca235e1","hard_disk_id":"43a80f74066271ecf87dbf4f4b11090b","mac_address":"cef4f0127875bd82694106cd9895c481","os":"mac","os_version":"14.1.1"},"materials":{"ai_translates":[],"audio_balances":[],"audio_effects":[],"audio_fades":[],"audio_track_indexes":[],"audios":[],"beats":[],"canvases":[{"album_image":"","blur":0.0,"color":"","id":"D1461EC7-38C1-4C21-97AF-6E4B4B5857A2","image":"","image_id":"","image_name":"","source_platform":0,"team_id":"","type":"canvas_color"}],"chromas":[],"color_curves":[],"digital_humans":[],"drafts":[],"effects":[],"flowers":[],"green_screens":[],"handwrites":[],"hsl":[],"images":[],"log_color_wheels":[],"loudnesses":[],"manual_deformations":[],"masks":[],"material_animations":[{"animations":[],"id":"800F8631-72E6-47E6-9F8F-8FF99B442907","multi_language_current":"none","type":"sticker_animation"},{"animations":[],"id":"1A2E2D8E-5783-42F6-831A-FC43B893A1E6","multi_language_current":"none","type":"sticker_animation"}],"material_colors":[],"multi_language_refs":[],"placeholders":[],"plugin_effects":[],"primary_color_wheels":[],"realtime_denoises":[],"shapes":[],"smart_crops":[],"smart_relights":[],"sound_channel_mappings":[{"audio_channel_mapping":0,"id":"913BF92E-DC8C-45AE-9DE4-88B4144DACB5","is_config_open":false,"type":""}],"speeds":[{"curve_speed":null,"id":"499F9346-EE92-40ED-8636-8800EC5B882B","mode":0,"speed":1.0,"type":"speed"}],"stickers":[],"tail_leaders":[],"text_templates":[],"texts":[{"add_type":0,"alignment":1,"background_alpha":1.0,"background_color":"","background_height":0.14,"background_horizontal_offset":0.0,"background_round_radius":0.0,"background_style":0,"background_vertical_offset":0.0,"background_width":0.14,"bold_width":0.0,"border_alpha":1.0,"border_color":"","border_width":0.08,"caption_template_info":{"category_id":"","category_name":"","effect_id":"","is_new":false,"path":"","request_id":"","resource_id":"","resource_name":"","source_platform":0},"check_flag":7,"combo_info":{"text_templates":[]},"content":"{\\"styles\\":[{\\"fill\\":{\\"content\\":{\\"solid\\":{\\"color\\":[1,0,0]}}},\\"range\\":[0,7],\\"useLetterColor\\":true,\\"size\\":15,\\"font\\":{\\"path\\":\\"/Applications/VideoFusion-macOS.app/Contents/Resources/Font/SystemFont/zh-hans.ttf\\",\\"id\\":\\"\\"}}],\\"text\\":\\"第一段测试文本\\"}","fixed_height":-1.0,"fixed_width":-1.0,"font_category_id":"","font_category_name":"","font_id":"","font_name":"","font_path":"/Applications/VideoFusion-macOS.app/Contents/Resources/Font/SystemFont/zh-hans.ttf","font_resource_id":"","font_size":15.0,"font_source_platform":0,"font_team_id":"","font_title":"none","font_url":"","fonts":[],"force_apply_line_max_width":false,"global_alpha":1.0,"group_id":"","has_shadow":false,"id":"5E99E688-10C3-4AA2-A031-8563FEF1292D","initial_scale":1.0,"inner_padding":-1.0,"is_rich_text":false,"italic_degree":0,"ktv_color":"","language":"","layer_weight":1,"letter_spacing":0.0,"line_feed":1,"line_max_width":0.82,"line_spacing":0.02,"multi_language_current":"none","name":"","original_size":[],"preset_category":"","preset_category_id":"","preset_has_set_alignment":false,"preset_id":"","preset_index":0,"preset_name":"","recognize_task_id":"","recognize_type":0,"relevance_segment":[],"shadow_alpha":0.8,"shadow_angle":-45.0,"shadow_color":"","shadow_distance":8.0,"shadow_point":{"x":1.0182337649086284,"y":-1.0182337649086284},"shadow_smoothing":1.0,"shape_clip_x":false,"shape_clip_y":false,"source_from":"","style_name":"","sub_type":0,"subtitle_keywords":null,"subtitle_template_original_fontsize":0.0,"text_alpha":1.0,"text_color":"#ff0000","text_curve":null,"text_preset_resource_id":"","text_size":30,"text_to_audio_ids":[],"tts_auto_update":false,"type":"text","typesetting":0,"underline":false,"underline_offset":0.22,"underline_width":0.05,"use_effect_default_color":false,"words":{"end_time":[],"start_time":[],"text":[]}},{"add_type":0,"alignment":1,"background_alpha":1.0,"background_color":"","background_height":0.14,"background_horizontal_offset":0.0,"background_round_radius":0.0,"background_style":0,"background_vertical_offset":0.0,"background_width":0.14,"bold_width":0.0,"border_alpha":1.0,"border_color":"#00ff00","border_width":0.04064499959349632,"caption_template_info":{"category_id":"","category_name":"","effect_id":"","is_new":false,"path":"","request_id":"","resource_id":"","resource_name":"","source_platform":0},"check_flag":15,"combo_info":{"text_templates":[]},"content":"{\\"styles\\":[{\\"fill\\":{\\"content\\":{\\"solid\\":{\\"color\\":[1,1,1]}}},\\"range\\":[0,2],\\"size\\":15,\\"font\\":{\\"path\\":\\"/Applications/VideoFusion-macOS.app/Contents/Resources/Font/SystemFont/zh-hans.ttf\\",\\"id\\":\\"\\"}},{\\"fill\\":{\\"content\\":{\\"solid\\":{\\"color\\":[0,0,0]}}},\\"range\\":[2,5],\\"strokes\\":[{\\"width\\":0.08,\\"content\\":{\\"solid\\":{\\"color\\":[1,0,0]}}}],\\"useLetterColor\\":true,\\"size\\":15,\\"font\\":{\\"path\\":\\"/Applications/VideoFusion-macOS.app/Contents/Resources/Font/SystemFont/zh-hans.ttf\\",\\"id\\":\\"\\"}},{\\"fill\\":{\\"content\\":{\\"solid\\":{\\"color\\":[1,1,1]}}},\\"range\\":[5,6],\\"strokes\\":[{\\"width\\":0.2,\\"content\\":{\\"solid\\":{\\"color\\":[0,1,0]}}}],\\"size\\":15,\\"font\\":{\\"path\\":\\"/Applications/VideoFusion-macOS.app/Contents/Resources/Font/SystemFont/zh-hans.ttf\\",\\"id\\":\\"\\"}},{\\"fill\\":{\\"content\\":{\\"solid\\":{\\"color\\":[1,1,1]}}},\\"range\\":[6,7],\\"strokes\\":[{\\"width\\":0.040645,\\"content\\":{\\"solid\\":{\\"color\\":[0,1,0]}}}],\\"size\\":15,\\"font\\":{\\"path\\":\\"/Applications/VideoFusion-macOS.app/Contents/Resources/Font/SystemFont/zh-hans.ttf\\",\\"id\\":\\"\\"}}],\\"text\\":\\"飘过一二六飘过\\"}","fixed_height":-1.0,"fixed_width":-1.0,"font_category_id":"","font_category_name":"","font_id":"","font_name":"","font_path":"/Applications/VideoFusion-macOS.app/Contents/Resources/Font/SystemFont/zh-hans.ttf","font_resource_id":"","font_size":15.0,"font_source_platform":0,"font_team_id":"","font_title":"none","font_url":"","fonts":[],"force_apply_line_max_width":false,"global_alpha":1.0,"group_id":"","has_shadow":false,"id":"019789EF-81F6-465F-BC01-5895EAC1E8E6","initial_scale":1.0,"inner_padding":-1.0,"is_rich_text":true,"italic_degree":0,"ktv_color":"","language":"","layer_weight":1,"letter_spacing":0.0,"line_feed":1,"line_max_width":0.82,"line_spacing":0.02,"multi_language_current":"none","name":"","original_size":[],"preset_category":"","preset_category_id":"","preset_has_set_alignment":false,"preset_id":"","preset_index":0,"preset_name":"","recognize_task_id":"","recognize_type":0,"relevance_segment":[],"shadow_alpha":0.8,"shadow_angle":-45.0,"shadow_color":"","shadow_distance":8.0,"shadow_point":{"x":1.0182337649086284,"y":-1.0182337649086284},"shadow_smoothing":1.0,"shape_clip_x":false,"shape_clip_y":false,"source_from":"","style_name":"","sub_type":0,"subtitle_keywords":null,"subtitle_template_original_fontsize":0.0,"text_alpha":1.0,"text_color":"#000000","text_curve":null,"text_preset_resource_id":"","text_size":30,"text_to_audio_ids":[],"tts_auto_update":false,"type":"text","typesetting":0,"underline":false,"underline_offset":0.22,"underline_width":0.05,"use_effect_default_color":false,"words":{"end_time":[],"start_time":[],"text":[]}}],"time_marks":[],"transitions":[],"video_effects":[],"video_trackings":[],"videos":[{"aigc_type":"none","audio_fade":null,"cartoon_path":"","category_id":"","category_name":"local","check_flag":63487,"crop":{"lower_left_x":0.0,"lower_left_y":1.0,"lower_right_x":1.0,"lower_right_y":1.0,"upper_left_x":0.0,"upper_left_y":0.0,"upper_right_x":1.0,"upper_right_y":0.0},"crop_ratio":"free","crop_scale":1.0,"duration":242600000,"extra_type_option":0,"formula_id":"","freeze":null,"has_audio":true,"height":1080,"id":"E23621DE-5496-4E10-8BC1-F5A3C58336E9","intensifies_audio_path":"","intensifies_path":"","is_ai_generate_content":false,"is_copyright":false,"is_text_edit_overdub":false,"is_unified_beauty_mode":false,"local_id":"","local_material_id":"851e2c19-213a-4d36-b31e-3b032ef3a620","material_id":"","material_name":"guangzi-1711788187758.mp4","material_url":"","matting":{"flag":0,"has_use_quick_brush":false,"has_use_quick_eraser":false,"interactiveTime":[],"path":"","strokes":[]},"media_path":"","object_locked":null,"origin_material_id":"","path":"/Users/zelong/Downloads/guangzi-1711788187758.mp4","picture_from":"none","picture_set_category_id":"","picture_set_category_name":"","request_id":"","reverse_intensifies_path":"","reverse_path":"","smart_motion":null,"source":0,"source_platform":0,"stable":{"matrix_path":"","stable_level":0,"time_range":{"duration":0,"start":0}},"team_id":"","type":"video","video_algorithm":{"algorithms":[],"complement_frame_config":null,"deflicker":null,"gameplay_configs":[],"motion_blur_config":null,"noise_reduction":null,"path":"","quality_enhance":null,"time_range":null},"width":1920}],"vocal_beautifys":[],"vocal_separations":[{"choice":0,"id":"77EE3BAB-94B8-46E5-86F9-7DFA62C31694","production_path":"","time_range":null,"type":"vocal_separation"}]},"mutable_config":null,"name":"","new_version":"107.0.0","platform":{"app_id":3704,"app_source":"lv","app_version":"5.7.0","device_id":"b38354c3039b562f711f68b5cca235e1","hard_disk_id":"43a80f74066271ecf87dbf4f4b11090b","mac_address":"cef4f0127875bd82694106cd9895c481","os":"mac","os_version":"14.1.1"},"relationships":[],"render_index_track_mode_on":true,"retouch_cover":null,"source":"default","static_cover_image_path":"","time_marks":null,"tracks":[{"attribute":0,"flag":0,"id":"08BC68AF-4AE3-420A-B7FB-81E634E5D4CD","is_default_name":true,"name":"","segments":[{"caption_info":null,"cartoon":false,"clip":{"alpha":1.0,"flip":{"horizontal":false,"vertical":false},"rotation":0.0,"scale":{"x":1.0,"y":1.0},"transform":{"x":0.0,"y":0.0}},"common_keyframes":[],"enable_adjust":true,"enable_color_curves":true,"enable_color_match_adjust":false,"enable_color_wheels":true,"enable_lut":true,"enable_smart_color_adjust":false,"extra_material_refs":["499F9346-EE92-40ED-8636-8800EC5B882B","D1461EC7-38C1-4C21-97AF-6E4B4B5857A2","913BF92E-DC8C-45AE-9DE4-88B4144DACB5","77EE3BAB-94B8-46E5-86F9-7DFA62C31694"],"group_id":"","hdr_settings":{"intensity":1.0,"mode":1,"nits":1000},"id":"408AE597-7D1D-4E5E-9A8D-BD66F54832B9","intensifies_audio":false,"is_placeholder":false,"is_tone_modify":false,"keyframe_refs":[],"last_nonzero_volume":1.0,"material_id":"E23621DE-5496-4E10-8BC1-F5A3C58336E9","render_index":0,"responsive_layout":{"enable":false,"horizontal_pos_layout":0,"size_layout":0,"target_follow":"","vertical_pos_layout":0},"reverse":false,"source_timerange":{"duration":242600000,"start":0},"speed":1.0,"target_timerange":{"duration":242600000,"start":0},"template_id":"","template_scene":"default","track_attribute":0,"track_render_index":0,"uniform_scale":{"on":true,"value":1.0},"visible":true,"volume":1.0}],"type":"video"},{"attribute":0,"flag":0,"id":"D51B34A9-136E-41B1-B4C3-91D6FBC184EC","is_default_name":true,"name":"","segments":[{"caption_info":null,"cartoon":false,"clip":{"alpha":1.0,"flip":{"horizontal":false,"vertical":false},"rotation":0.0,"scale":{"x":1.0,"y":1.0},"transform":{"x":0.0,"y":0.0}},"common_keyframes":[],"enable_adjust":false,"enable_color_curves":true,"enable_color_match_adjust":false,"enable_color_wheels":true,"enable_lut":false,"enable_smart_color_adjust":false,"extra_material_refs":["800F8631-72E6-47E6-9F8F-8FF99B442907"],"group_id":"","hdr_settings":null,"id":"DFF16C08-8093-44B1-9E5F-7CDCB3A04146","intensifies_audio":false,"is_placeholder":false,"is_tone_modify":false,"keyframe_refs":[],"last_nonzero_volume":1.0,"material_id":"5E99E688-10C3-4AA2-A031-8563FEF1292D","render_index":14000,"responsive_layout":{"enable":false,"horizontal_pos_layout":0,"size_layout":0,"target_follow":"","vertical_pos_layout":0},"reverse":false,"source_timerange":null,"speed":1.0,"target_timerange":{"duration":3000000,"start":900000},"template_id":"","template_scene":"default","track_attribute":0,"track_render_index":1,"uniform_scale":{"on":true,"value":1.0},"visible":true,"volume":1.0}],"type":"text"},{"attribute":0,"flag":0,"id":"B5EAE350-8764-43E2-A6FC-22ACC62EC015","is_default_name":true,"name":"","segments":[{"caption_info":null,"cartoon":false,"clip":{"alpha":1.0,"flip":{"horizontal":false,"vertical":false},"rotation":0.0,"scale":{"x":2.0,"y":2.0},"transform":{"x":-0.13138686131386856,"y":-0.4163059163059164}},"common_keyframes":[],"enable_adjust":false,"enable_color_curves":true,"enable_color_match_adjust":false,"enable_color_wheels":true,"enable_lut":false,"enable_smart_color_adjust":false,"extra_material_refs":["1A2E2D8E-5783-42F6-831A-FC43B893A1E6"],"group_id":"","hdr_settings":null,"id":"72D4C75F-8048-40B3-8189-AD0B35BC7910","intensifies_audio":false,"is_placeholder":false,"is_tone_modify":false,"keyframe_refs":[],"last_nonzero_volume":1.0,"material_id":"019789EF-81F6-465F-BC01-5895EAC1E8E6","render_index":14001,"responsive_layout":{"enable":false,"horizontal_pos_layout":0,"size_layout":0,"target_follow":"","vertical_pos_layout":0},"reverse":false,"source_timerange":null,"speed":1.0,"target_timerange":{"duration":3000000,"start":1800000},"template_id":"","template_scene":"default","track_attribute":0,"track_render_index":2,"uniform_scale":{"on":true,"value":1.0},"visible":true,"volume":1.0}],"type":"text"}],"update_time":0,"version":360000}'
    };
  },
  // created() {
  //   const j = JSON.parse(this.testString)
  //   this.readTexts(j)
  // },
  methods: {
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
      this.fileName = file.name

      const reader = new FileReader();
      reader.onload = (e) => {
        const json = JSON.parse(e.target.result);
        this.readTexts(json);
      };

      reader.readAsText(file);
    },

    readTexts(json) {
      this.fileRawJson = json
      this.fileTexts = assembleTextArrModel(json)
    },

    searchTexts() {
      this.matchingTexts = searchTextsByContains(this.fileTexts, this.searchKey)
    },

    colorReplaceApplyClick() {
      this.fileRawJson = applySpecificColorToRawJson(this.fileRawJson, this.fileTexts, this.searchKey, this.foregroundColor, this.strokeColor)
      this.fileTexts = assembleTextArrModel(this.fileRawJson)
    },

    showToast(msg) {
      VsToast.show({
        message: msg,
        showClose: false,
      });
    },

    downloadFile() {
      const jsonString = JSON.stringify(this.fileRawJson, null);

      const blob = new Blob([jsonString], {type: 'application/json'});

      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = this.fileName; // 设置下载的文件名
      document.body.appendChild(a); // 添加到文档中

      a.click(); // 模拟点击
      document.body.removeChild(a); // 下载后移除元素
      URL.revokeObjectURL(url); // 释放URL对象
    }
  }

};
</script>

<style>
body {
  padding: 0;
  margin: 0;
}

.page-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: start;
  justify-content: start;
  background-color: #000;
}

.container-left {
  width: 24vw;
  min-width: 270px;
  height: 100%;
  /*background-color: #2c3e50;*/
  justify-content: start;
  align-items: center;
  display: flex;
  flex-direction: column;
  /*border-radius: 6px;*/
}

.container-right {
  width: 76vw;
  height: 100%;
  /*background-color: #42b983;*/
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  background-color: #2c2c2c;
  /*overflow: auto;*/

}

.texts-container {
  height: 90%;
  width: 90%;
  margin-top: 5%;
  margin-left: 5%;
  /*background-color: #42b983;*/
  padding: 5%;
  /*padding: 5% -5% -5% 5%;*/
  overflow: auto;
  box-sizing: border-box;

}

.btn-upload {
  margin-top: 30%;
  background: none;
  color: white;
  border: 1px solid white;
  border-radius: 8px;
  padding: 8px 50px;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.span-text-item {
  margin-bottom: 20px;
  font-size: 16px;
  color: white;
}

.color-module-corner_bg {
  width: 80%;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  padding: 14px;
  box-sizing: border-box;
  margin-top: 24px;
  border-radius: 8px;
}

.input-setting-container {
  display: flex;
  width: 100%;
  flex-direction: row;
  /*justify-content: center;*/
  align-items: center;
}

.input-replace-setting {
  background-color: black; /* 背景色黑色 */
  color: white; /* 文本颜色白色 */
  border-radius: 8px; /* 圆角8px */
  padding: 10px 15px; /* 内边距 */
  border: none; /* 没有边框 */
  box-sizing: border-box; /* 边框和内填充包含在宽度内 */
  font-size: 12px; /* 字体大小 */
  flex: 1;
}


.input-replace-setting::placeholder {
  color: gray;
}

.input-replace-setting:focus {
  outline: none; /* 移除焦点轮廓 */
  caret-color: white; /* 光标颜色白色 */
}

.tips-warning {
  margin-top: 10px;
  color: white;
  font-size: 12px;
}

.container-setting-item {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.btn-apply-color-replace {
  width: 100%;
  height: 32px;
  background-color: white;
  border-radius: 8px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: 10px;
}

.span-matching-text {
  color: white;
  font-size: 12px;
  margin-top: 4px;
}

.btn-download {
  height: 32px;
  width: 80%;
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: white;
  margin-top: 20px;
  cursor: pointer;
}

.texts-item-container {
  /*background-color: #42b983;*/
  height: 40px;
  width: 100%;
  margin-top: 10px;
}
</style>