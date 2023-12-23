use candle::{DType, Device, Module, Tensor};
use candle_nn::VarBuilder;
use candle_transformers::models::{
    jina_bert::{BertModel, Config},
    stable_diffusion::embeddings,
};
use hello_wasm::console_log;
use tokenizers::{PaddingParams, Tokenizer};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Model {
    model: BertModel,
    tokenizer: Tokenizer,
}

#[wasm_bindgen]
impl Model {
    #[wasm_bindgen(constructor)]
    pub fn load(weights: Vec<u8>, tokenizer: Vec<u8>, config: Vec<u8>) -> Result<Model, JsError> {
        console_error_panic_hook::set_once();
        console_log!("loading model");
        let device = &Device::Cpu;
        let vb = VarBuilder::from_buffered_safetensors(weights, DType::F64, device)?;
        let config: Config = serde_json::from_slice(&config)?;
        let tokenizer =
            Tokenizer::from_bytes(&tokenizer).map_err(|m| JsError::new(&m.to_string()))?;
        let model = BertModel::new(vb, &config)?;

        Ok(Self { model, tokenizer })
    }

    pub fn get_embeddings(&mut self, input: JsValue) -> Result<JsValue, JsError> {
        let input: Params =
            serde_wasm_bindgen::from_value(input).map_err(|m| JsError::new(&m.to_string()))?;
        let sentences = input.sentences;

        let prompt = "test".to_string();
        let device = &Device::Cpu;
        let tokenizer = self
            .tokenizer
            .with_padding(None)
            .with_truncation(None)
            .map_err(|m| JsError::new(&m.to_string()))?;

        let tokens = tokenizer
            .encode(prompt, true)
            .map_err(|m| JsError::new(&m.to_string()))?
            .get_ids()
            .to_vec();

        let token_ids = Tensor::new(&tokens[..], device)?.unsqueeze(0)?;

        console_log!("Loaded and encoded");

        let start = std::time::Instant::now();
        let embeddings = self.model.forward(&token_ids)?;
        console_log!("Took {:?}", start.elapsed());

        let embeddings_data = embeddings.to_vec2()?;
        Ok(serde_wasm_bindgen::to_value(&Embeddings {
            data: embeddings_data,
        })?)
    }
}

#[derive(serde::Serialize, serde::Deserialize)]
struct Embeddings {
    data: Vec<Vec<f64>>,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct Params {
    sentences: Vec<String>,
    normalize_embeddings: bool,
}
fn main() {
    console_error_panic_hook::set_once();
}
