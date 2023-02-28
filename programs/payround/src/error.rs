use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
  #[msg("Admin Signer Only")]
  NotAdmin,

  #[msg("Desc characters greater than max lenght")]
  MaxDescLenghtExceeded,
  
  #[msg("The provided keys do not match")]
  KeysDontMatch,

  #[msg("Limit reached. Cannot add task or group")]
  MaxLimitReached
}