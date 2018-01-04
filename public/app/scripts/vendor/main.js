function editImage(index, event)
{
    'use strict';

    var scope = angular.element(document.getElementById("column-left")).scope();
    scope.$apply(function() {
        scope.editImage = true;
    })
    var div = document.getElementById("imageOptions");
    var x = event.clientX;
    var y = event.pageY;
    div.style.display = "block";
    if (window.innerWidth < 760) {
        div.style.top = y + 'px';
    } else {
        div.style.top = y + 'px';
        div.style.left = x + 100 + 'px';
    }
    var Cropper = window.Cropper;
  var URL = window.URL || window.webkitURL;
    var container = document.querySelector("div[dataId='" + index + "']");
    var image = container.getElementsByTagName('img').item(0);
  var actions = document.getElementById('actions');
//  var dataX = document.getElementById('dataX');
//  var dataY = document.getElementById('dataY');
//  var dataHeight = document.getElementById('dataHeight');
//  var dataWidth = document.getElementById('dataWidth');
//  var dataRotate = document.getElementById('dataRotate');
//  var dataScaleX = document.getElementById('dataScaleX');
//  var dataScaleY = document.getElementById('dataScaleY');
  var options = {
        aspectRatio: NaN,
        preview: '.img-preview',
        ready: function(e) {
        },
        cropstart: function(e) {
        },
        cropmove: function(e) {
        },
        cropend: function(e) {
        },
        crop: function (e) {
          var data = e.detail;

//          dataX.value = Math.round(data.x);
//          dataY.value = Math.round(data.y);
//          dataHeight.value = Math.round(data.height);
//          dataWidth.value = Math.round(data.width);
//          dataRotate.value = typeof data.rotate !== 'undefined' ? data.rotate : '';
//          dataScaleX.value = typeof data.scaleX !== 'undefined' ? data.scaleX : '';
//          dataScaleY.value = typeof data.scaleY !== 'undefined' ? data.scaleY : '';
        },
        zoom: function(e) {
        }
      };
  var cropper = new Cropper(image, options);
    var originalImageURL = image.src;
  var uploadedImageType = 'image/jpeg';
  var uploadedImageURL;

  // Tooltip
  $('[data-toggle="tooltip"]').tooltip();


  // Buttons
  if (!document.createElement('canvas').getContext) {
    $('button[data-method="getCroppedCanvas"]').prop('disabled', true);
  }

  if (typeof document.createElement('cropper').style.transition === 'undefined') {
    $('button[data-method="rotate"]').prop('disabled', true);
    $('button[data-method="scale"]').prop('disabled', true);
  }

  // Options
  actions.querySelector('.docs-toggles').onchange = function (event) {
    var e = event || window.event;
    var target = e.target || e.srcElement;
    var cropBoxData;
    var canvasData;
    var isCheckbox;
    var isRadio;

    if (!cropper) {
      return;
    }

    if (target.tagName.toLowerCase() === 'label') {
      target = target.querySelector('input');
    }

    isCheckbox = target.type === 'checkbox';
    isRadio = target.type === 'radio';

    if (isCheckbox || isRadio) {
      if (isCheckbox) {
        options[target.name] = target.checked;
        cropBoxData = cropper.getCropBoxData();
        canvasData = cropper.getCanvasData();

                options.ready = function() {
          cropper.setCropBoxData(cropBoxData).setCanvasData(canvasData);
        };
      } else {
        options[target.name] = target.value;
                options.ready = function() {
        };
      }

      // Restart
      cropper.destroy();
      cropper = new Cropper(image, options);
    }
  };

  // Methods
    actions.querySelector('.docs-buttons').onclick = function(event) {
    var e = event || window.event;
    var target = e.target || e.srcElement;
    var result;
    var input;
        var data;
    if (!cropper) {
      return;
    }

    while (target !== this) {
      if (target.getAttribute('data-method')) {
        break;
      }

      target = target.parentNode;
    }

    if (target === this || target.disabled || target.className.indexOf('disabled') > -1) {
      return;
    }

    data = {
      method: target.getAttribute('data-method'),
      target: target.getAttribute('data-target'),
      option: target.getAttribute('data-option'),
      secondOption: target.getAttribute('data-second-option')
        };
    if (data.method) {
      if (typeof data.target !== 'undefined') {
        input = document.querySelector(data.target);

        if (!target.hasAttribute('data-option') && data.target && input) {
          try {
            data.option = JSON.parse(input.value);
                    } catch (e) {
          }
        }
      }

      switch (data.method) {
        case 'rotate':
          cropper.clear();
          break;

        case 'getCroppedCanvas':
          try {
            data.option = JSON.parse(data.option);
                    } catch (e) {
          }

          if (uploadedImageType === 'image/jpeg') {
            if (!data.option) {
              data.option = {};
            }

            data.option.fillColor = '#fff';
          }

          break;
      }

            result = cropper[data.method](data.option, data.secondOption);
      switch (data.method) {
        case 'rotate':
          cropper.crop();
          break;

        case 'scaleX':
        case 'scaleY':
          target.setAttribute('data-option', -data.option);
          break;

        case 'getCroppedCanvas':
                    if (result) {
                        var dataURL = result.toDataURL(uploadedImageType);

                        scope.$apply(function() {
                            scope.dataURItoBlob(dataURL, index);
                            scope.editImage = false;
                        })
                        cropper.destroy(dataURL);



          }

          break;

        case 'destroy':
                    cropper = null;
                    scope.editImage = false;
                    if (uploadedImageURL) {
            URL.revokeObjectURL(uploadedImageURL);
            uploadedImageURL = '';
            image.src = originalImageURL;
          }

          break;
      }

      if (typeof result === 'object' && result !== cropper && input) {
        try {
          input.value = JSON.stringify(result);
                } catch (e) {
        }
      }
    }
  };

  document.body.onkeydown = function (event) {
    var e = event || window.event;

    if (!cropper || this.scrollTop > 300) {
      return;
    }

    switch (e.keyCode) {
      case 37:
        e.preventDefault();
        cropper.move(-1, 0);
        break;

      case 38:
        e.preventDefault();
        cropper.move(0, -1);
        break;

      case 39:
        e.preventDefault();
        cropper.move(1, 0);
        break;

      case 40:
        e.preventDefault();
        cropper.move(0, 1);
        break;
    }
  };


  // Import image
//  var inputImage = document.getElementById('inputImage');
//
//  if (URL) {
//    inputImage.onchange = function () {
//      var files = this.files;
//      var file;
//
//      if (cropper && files && files.length) {
//        file = files[0];
//
//        if (/^image\/\w+/.test(file.type)) {
//          uploadedImageType = file.type;
//
//          if (uploadedImageURL) {
//            URL.revokeObjectURL(uploadedImageURL);
//          }
//
//          image.src = uploadedImageURL = URL.createObjectURL(file);
//          cropper.destroy();
//          cropper = new Cropper(image, options);
//          inputImage.value = null;
//        } else {
//          window.alert('Please choose an image file.');
//        }
//      }
//    };
//  } else {
//    inputImage.disabled = true;
//    inputImage.parentNode.className += ' disabled';
//  }
}
