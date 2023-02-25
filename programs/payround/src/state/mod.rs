use anchor_lang::prelude::*;

use crate::constants::SEED_THREAD;

#[account]
pub struct PayroundAccount {
  pub pubkey: Pubkey,
  pub authority: Pubkey,
  pub user_id: Pubkey,
  pub usdc_token_account: Pubkey,
  pub email: bool,
  pub bump: u8,
}

// #[account]
// pub struct TaskSchedule {
//   pub pubkey: Pubkey,
//   pub account: Pubkey,
//   pub authority: Pubkey,
//   pub schedule_list: Pubkey,
// }

impl PayroundAccount {
  pub fn init (&mut self, pubkey: Pubkey, authority: Pubkey, user_id: Pubkey, usdc_token_key: Pubkey, bump: u8, email: bool) {
    self.pubkey = pubkey;
    self. authority = authority;
    self.user_id = user_id;
    self.usdc_token_account = usdc_token_key;
    self.bump = bump;
    self.email = email
  }
}

#[account]
pub struct Task {
    pub pubkey: Pubkey,
    pub task_group: Pubkey,
    pub account: Pubkey, // email or degen
    pub authority: Pubkey,
    pub recipient: Pubkey,
    pub thread: Pubkey,
    // pub status: TaskStatus,
    pub bump: u8,
    pub amount: u64,
    pub label: String,
    pub desc: String,
}

impl Task {
    pub fn new(
        &mut self,
        ammount: u64,
        pubkey: Pubkey,
        task_group_key: Pubkey,
        account: Pubkey,
        authority: Pubkey,
        recipient_ata: Pubkey,
        label: String,
        desc: String,
    ) {
        self.amount = ammount;
        self.pubkey = pubkey;
        self.task_group = task_group_key;
        self.authority = authority;
        self.recipient = recipient_ata;
        self.account = account;
        self.desc = desc;
        (self.thread, self.bump) = Pubkey::find_program_address(
        &[SEED_THREAD, pubkey.as_ref(), label.as_ref()],
        &clockwork_sdk::ID,
    );

    }

    pub fn update_amount (&mut self, amount: u64) {
      self.amount = amount
    }

    pub fn update_group (&mut self, current_group_key: Pubkey, new_group_key: Pubkey) {
      if self.task_group == current_group_key {
        self.task_group = new_group_key
      }
    }
}

pub enum TaskStatus {
  STARTED = 0,
  PAUSED = 1,
  ENDED = 2
}

#[account]
pub struct TaskGroup {
    pub pubkey: Pubkey,
    pub authority: Pubkey,
    pub account: Pubkey,
    pub desc: String,
    pub tasklist: Pubkey,
}

impl TaskGroup {
  pub fn init (&mut self, pubkey: Pubkey, authority: Pubkey, account: Pubkey, tasklist: Pubkey, desc: String ) {
    self.pubkey = pubkey;
    self.authority = authority;
    self.account = account;
    self.tasklist = tasklist;
    self.desc = desc;
  }
}

#[account(zero_copy)]
pub struct Tasklist {
    pub task_group: Pubkey,
    pub last_task: Pubkey,
    pub count: u16,
    pub max: u16,
    pub list: [Pubkey; 1000],  //todo: change to vec!
}


impl Tasklist {
  pub fn init (&mut self, task_group_key: Pubkey) {
    self.task_group = task_group_key;
    self.count = 0;
    self.list = [Pubkey::default(); 1000]
  }

  pub fn add_task (&mut self, task: Pubkey) {
    self.list[self.count as usize] = task;
    self.count = self.count + 1
  }

  pub fn remove_task (&mut self, task: Pubkey) {
    let new_count = self.count -1;
    let index = self.list
        .iter()
        .position(|&x| x == task)
        .unwrap();
    self.list[index] = self.list[new_count as usize];
    self.count = new_count;
  }
}

#[account(zero_copy)]
pub struct Tasklist2 {
    pub pubkey: Pubkey,
    pub owner_key: Pubkey,
    pub schedule_list: bool,
    pub count: u16,
    pub max: u16,
    pub list: [Pubkey; 1000],  //todo: change to vec!
}
