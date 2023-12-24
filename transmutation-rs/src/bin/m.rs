use candle::{DType, Device, Module, Tensor};
use candle_nn::VarBuilder;
use candle_transformers::models::bert::{BertModel, Config};
use tokenizers::Tokenizer;
use transmutation_rs::console_log;
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

        let vb = VarBuilder::from_buffered_safetensors(weights, DType::F64, device).unwrap();

        console_log!("loading model1");
        let config: Config = serde_json::from_slice(&config)?;
        let tokenizer =
            Tokenizer::from_bytes(&tokenizer).map_err(|m| JsError::new(&m.to_string()))?;

        let model = BertModel::load(vb, &config)?;

        Ok(Self { model, tokenizer })
    }

    pub fn forward(&mut self, input: JsValue) -> Result<JsValue, JsError> {
        let input: Params =
            serde_wasm_bindgen::from_value(input).map_err(|m| JsError::new(&m.to_string()))?;
        let sentences = input.sentences;

        let prompt = sentences.last().unwrap().to_string();
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
        let token_type_ids = token_ids.zeros_like()?;
        console_log!("Loaded and encoded");

        let embeddings = self.model.forward(&token_ids, &token_type_ids)?;

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
