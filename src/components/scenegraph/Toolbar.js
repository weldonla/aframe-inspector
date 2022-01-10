import classnames from 'classnames';
import React from 'react';
import Events from '../../lib/Events.js';
import { saveBlob, saveString } from '../../lib/utils';

const LOCALSTORAGE_MOCAP_UI = 'aframeinspectormocapuienabled';

function filterHelpers(scene, visible) {
  scene.traverse(o => {
    if (o.userData.source === 'INSPECTOR') {
      o.visible = visible;
    }
  });
}

function getSceneName(scene) {
  return scene.id || slugify(window.location.host + window.location.pathname);
}

/**
 * Slugify the string removing non-word chars and spaces
 * @param  {string} text String to slugify
 * @return {string}      Slugified string
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '-') // Replace all non-word chars with -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Tools and actions.
 */
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isPlaying: false
    };
  }

  exportSceneToGLTF() {
    ga('send', 'event', 'SceneGraph', 'exportGLTF');
    const sceneName = getSceneName(AFRAME.scenes[0]);
    const scene = AFRAME.scenes[0].object3D;
    filterHelpers(scene, false);
    AFRAME.INSPECTOR.exporters.gltf.parse(
      scene,
      function (buffer) {
        filterHelpers(scene, true);
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveBlob(blob, sceneName + '.glb');
      },
      { binary: true }
    );
  }

  addEntity() {
    Events.emit('entitycreate', { element: 'a-entity', components: {} });
  }

  /**
   * Try to write changes with aframe-inspector-watcher.
   */
  writeChanges = () => {
    const fileString = this.getUpperHTML() + document.querySelector("a-scene").outerHTML;
    this.download("index.html", fileString);
  };

  toggleScenePlaying = () => {
    if (this.state.isPlaying) {
      AFRAME.scenes[0].pause();
      this.setState({ isPlaying: false });
      AFRAME.scenes[0].isPlaying = true;
      document.getElementById('aframeInspectorMouseCursor').play();
      return;
    }
    AFRAME.scenes[0].isPlaying = false;
    AFRAME.scenes[0].play();
    this.setState({ isPlaying: true });
  };

  render() {
    const watcherClassNames = classnames({
      button: true,
      fa: true,
      'fa-save': true
    });
    const watcherTitle = 'Write changes with aframe-watcher.';

    return (
      <div id="toolbar">
        <div className="toolbarActions">
          <a
            className="button fa fa-plus"
            title="Add a new entity"
            onClick={this.addEntity}
          />
          <a
            id="playPauseScene"
            className={'button fa ' + (this.state.isPlaying ? 'fa-pause' : 'fa-play')}
            title={this.state.isPlaying ? 'Pause scene' : 'Resume scene'}
            onClick={this.toggleScenePlaying}>
          </a>
          <a
            className="gltfIcon"
            title="Export to GLTF"
            onClick={this.exportSceneToGLTF}>
            <img src={process.env.NODE_ENV === 'production' ? 'https://aframe.io/aframe-inspector/assets/gltf.svg' : '../assets/gltf.svg'} />
          </a>
          <a
            className={watcherClassNames}
            title={watcherTitle}
            onClick={this.writeChanges}
          />
        </div>
      </div>
    );
  }

  download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' +
      encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  getUpperHTML() {
    return (
      `
<!-- include aframe -->
<script src="https://aframe.io/releases/0.9.2/aframe.min.js"></script>
<!-- include ar.js -->
<script src="https://cdn.rawgit.com/jeromeetienne/AR.js/1.7.2/aframe/build/aframe-ar.js"></script>
<!-- to load .ply model -->
<script src="https://rawgit.com/donmccurdy/aframe-extras/v3.13.1/dist/aframe-extras.loaders.min.js"></script>

<!-- END: Top HTML -->
<script>
    AFRAME.registerComponent('button', {
        init: function () {
            var elem = document.documentElement;
            var marker = document.querySelector("#marker");
            var fullbutton = document.querySelector("#fullscreen");
            var button = document.querySelector("#mutebutton");
            var Video_1 = document.querySelector("#Video_Asset_1");
            var Plane_2 = document.querySelector("#Plane_2");
            marker.addEventListener("markerFound", function (evt) {
                Video_1.play();
            });
            marker.addEventListener("markerLost", function (evt) {
                Video_1.pause();
            });
            button.addEventListener("click", function (evt) {
                console.log("button clicked")
                if (Video_1.muted == true) {
                    button.innerHTML = "Mute";
                    Video_1.muted = false;
                } else {
                    button.innerHTML = "Unmute";
                    Video_1.muted = true;
                }
            });
            Plane_2.addEventListener("mousedown", function (evt) {
                open("https://www.unity.com");
            });
            fullbutton.addEventListener("click", function (evt) {
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.mozRequestFullScreen) {
                    /* Firefox */
                    elem.mozRequestFullScreen();
                } else if (elem.webkitRequestFullscreen) {
                    /* Chrome, Safari and Opera */
                    elem.webkitRequestFullscreen();
                } else if (elem.msRequestFullscreen) {
                    /* IE/Edge */
                    elem.msRequestFullscreen();
                }
            });
        }
    });
</script>
<div style='position: absolute; bottom: 10px; right: 30px; width:100%; text-align: center; z-index: 1;'>
    <button id="mutebutton" style='position: absolute; bottom: 10px'>
        Unmute
    </button>
</div>
<div style='position: absolute; bottom: 5px; right: 30px; width:100%; text-align: left; z-index: 1;'>
    <input type="image" id="fullscreen" src="fullscreen.png" style='position: absolute; bottom: 0px; left: 35px;'>
    </input>
</div>`
    );
  }

}
