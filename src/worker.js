import { AutoModel, AutoProcessor, RawImage, env } from '@huggingface/transformers';

// Disable local models since we are fetching from huggingface hub
env.allowLocalModels = false;

class RMBGPipeline {
  static model = null;
  static processor = null;
  static activeDevice = 'webgpu';

  static async getInstance(progress_callback = null) {
    if (!this.model || !this.processor) {
      try {
        console.log('Loading RMBG-1.4 with WebGPU...');
        this.model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
          device: 'webgpu',
          config: { model_type: 'custom' },
          progress_callback,
        });
        this.processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4', {
          config: {
            do_normalize: true,
            image_mean: [0.5, 0.5, 0.5],
            image_std: [1, 1, 1],
            size: { width: 1024, height: 1024 },
          },
        });
        this.activeDevice = 'webgpu';
        console.log('Loaded RMBG-1.4 on WebGPU successfully.');
      } catch (err) {
        console.warn('WebGPU failed, falling back to WASM...', err);
        this.model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
          device: 'wasm',
          config: { model_type: 'custom' },
          progress_callback,
        });
        this.processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4', {
          config: {
            do_normalize: true,
            image_mean: [0.5, 0.5, 0.5],
            image_std: [1, 1, 1],
            size: { width: 1024, height: 1024 },
          },
        });
        this.activeDevice = 'wasm';
        console.log('Loaded RMBG-1.4 on WASM successfully.');
      }
    }
    return { model: this.model, processor: this.processor };
  }
}

self.addEventListener('message', async (event) => {
  const { type, image, id } = event.data;

  if (type === 'init') {
    self.postMessage({ status: 'init_start' });
    try {
      await RMBGPipeline.getInstance((progress) => {
        self.postMessage({ status: 'progress', progress });
      });
      self.postMessage({
        status: 'init_complete',
        device: RMBGPipeline.activeDevice,
      });
    } catch (error) {
      console.error('Model initialization error:', error);
      self.postMessage({ status: 'error', error: error.message || 'Failed to initialize model.' });
    }
  }

  if (type === 'segment') {
    self.postMessage({ status: 'segment_start', id });
    try {
      const { model, processor } = await RMBGPipeline.getInstance();

      // Load image into RawImage and preprocess with 1024x1024 normalization
      const imageObj = await RawImage.fromURL(image);
      const { pixel_values } = await processor(imageObj);

      // Run inference
      const { output } = await model({ input: pixel_values });

      // Convert tensor output to mask and resize back to original image dimensions
      const maskRaw = await RawImage.fromTensor(
        output[0].mul(255).to('uint8')
      ).resize(imageObj.width, imageObj.height);

      self.postMessage({
        status: 'segment_complete',
        id,
        mask: {
          data: maskRaw.data,
          width: maskRaw.width,
          height: maskRaw.height,
          channels: maskRaw.channels || 1,
        },
      });
    } catch (error) {
      console.error('Segmentation error:', error);
      self.postMessage({ status: 'error', id, error: error.message || 'Image segmentation failed.' });
    }
  }
});
