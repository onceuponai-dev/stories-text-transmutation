//mod utils;
//pub use bert::{BertModel, Config, DTYPE};
use candle_transformers::models::bert;
use reqwest;
use wasm_bindgen::prelude::*;

pub use bert::{BertModel, Config, DTYPE};
//pub use tokenizers::{PaddingParams, Tokenizer};

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);
}

#[macro_export]
macro_rules! console_log {
    // Note that this is using the `log` function imported above during
    // `bare_bones`
    ($($t:tt)*) => ($crate::log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub async fn greet() -> Result<JsValue, JsValue> {
    let mut url = "http://localhost:8000/data/a147z230801.xml";
    //url = "https://static.nbp.pl/dane/kursy/xml/a147z230801.xml";

    let res = reqwest::get(url).await.unwrap().text().await.unwrap();
    alert("Hello, hello-wasm!");
    Ok(JsValue::from(res))
}
