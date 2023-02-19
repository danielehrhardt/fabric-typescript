// Import stylesheets
import { image } from './left';
import './style.css';

import * as fa from 'fabric';
const fabric = fa.fabric;

const canvas = new fabric.Canvas('domcanvas', {
  backgroundColor: '#fff',
  selection: false,
  preserveObjectStacking: true,
});

let initialScaleFactorToFitCanvas;
let fabricPhotoObject;
let canvasWidthAndHeight = 400;
let currentScaleValue = 0;
let currentRotationValue = 0;
let blurredCanvas;

showInCanvas(image);

function applyBlurSelection(leftOffset = 0, topOffset = 0, imageObj = null) {
  if (imageObj) {
    imageObj.width = imageObj.scaleX * imageObj.width;
    imageObj.height = imageObj.scaleY * imageObj.height;
    imageObj.cropX = canvas.getWidth() + leftOffset;
    imageObj.cropY = canvas.getHeight() + topOffset;
    imageObj.scaleX = 1;
    imageObj.scaleY = 1;
    canvas.renderAll();
  } else {
    const image = fabric.Image.fromURL(blurredCanvas.toDataURL(), (img) => {
      img.width = 200;
      img.height = 80;
      img.cropX = canvas.getWidth() + leftOffset;
      img.cropY = canvas.getWidth() + topOffset;
      canvas.add(img);
      img.bringToFront();
      img.on('moving', (options) => {
        const newLeftOffset = options.transform.target.left;
        const newTopOffset = options.transform.target.top;
        applyBlurSelection(
          newLeftOffset,
          newTopOffset,
          (img = options.transform.target)
        );
      });

      img.on('scaling', (options) => {
        const newLeftOffset = options.transform.target.left;
        const newTopOffset = options.transform.target.top;
        applyBlurSelection(
          newLeftOffset,
          newTopOffset,
          (img = options.transform.target)
        );
      });
    });
  }
}

function createBlurredCanvas() {
  const canvasObjects = canvas.getObjects();
  const copiedCanvas = canvas.toCanvasElement();
  const blurredImage = new fabric.Image(copiedCanvas);
  const blurFilter = new fabric.Image.filters.Blur({
    blur: 0.3,
  });
  blurredImage.filters.push(blurFilter);
  blurredImage.applyFilters();

  blurredCanvas = new fabric.Canvas(copiedCanvas);
  blurredCanvas.setDimensions({
    width: canvas.getWidth() * 2,
    height: canvas.getHeight() * 2,
  });
  blurredImage.set({
    left: canvas.getWidth(),
    top: canvas.getHeight(),
  });
  blurredCanvas.add(blurredImage);
  blurredCanvas.renderAll();
}

function showInCanvas(photoUrl) {
  const reader = new FileReader();

  const setPhotoInstanceInController = (img) => {
    fabricPhotoObject = img;
  };

  const setInitialScaleFactor = (img) => {
    initialScaleFactorToFitCanvas = getScaleFactorToFitCanvas(
      {
        width: img.width,
        height: img.height,
      },
      canvasWidthAndHeight
    );
    currentScaleValue = initialScaleFactorToFitCanvas;
    return initialScaleFactorToFitCanvas;
  };

  fabric.Image.fromURL(photoUrl, (img) => {
    fabric.Image.fromURL(
      'https://codext.de/wp-content/uploads/2021/05/codext-gmbh-dark.svg',
      (logoImg) => {
        logoImg.set({
          left: 0,
          top: 0,
          originX: 'center',
          originY: 'center',
          angle: 0,
          width: logoImg.getOriginalSize().width,
          height: logoImg.getOriginalSize().height,
          hasControls: true,
          centeredScaling: true,
        });
        setPhotoInstanceInController(img);
        const scaleFactor = setInitialScaleFactor(img);
        const oImg = img.set({
          left: 0,
          top: 0,
          originX: 'center',
          originY: 'center',
          angle: 0,
          width: img.getOriginalSize().width,
          height: img.getOriginalSize().height,
          hasControls: false,
          centeredScaling: true,
        });
        canvas.clear();
        oImg.scale(scaleFactor);
        //canvas.add(oImg);
        //canvas.centerObject(oImg);
        const group = new fabric.Group([logoImg, img], {
          left: 0,
          top: 0,
          angle: 10,
        });
        canvas.add(group);
        canvas.renderAll();
        //canvas.sendToBack(img);
        createBlurredCanvas();
        applyBlurSelection();
      }
    );
  });
}

function getScaleFactorToFitCanvas(resolution, canvasWidthAndHeight) {
  const widthFactor = canvasWidthAndHeight / resolution.width;
  const heightFactor = canvasWidthAndHeight / resolution.height;
  const scaleFactor = Math.max(widthFactor, heightFactor);
  return scaleFactor;
}
