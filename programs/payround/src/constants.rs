use anchor_lang::prelude::Pubkey;
use static_pubkey::static_pubkey;

pub static  ADMIN_SIGNER: Pubkey = static_pubkey!("9i7RCR2knU7HrVyyDicAfrSyZmfKh2xtM88BDSou2bno");
pub const PAYROUND_SEED: &[u8] = b"payround";
pub const SEED_THREAD: &[u8] = b"thread";
pub const MAX_DESC_CHAR: usize = 32;
pub const MAX_TASK: usize = 1000;
pub const MAX_GROUP: usize = 32;
