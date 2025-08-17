export interface BrokerLoginRequest {
  client_id: string;
  pin: string;
  totp_token: string;
}

export interface TOTPSetup {
  secret: string;
  qr_code: string;
}

export interface BrokerProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  broker_name: string;
  client_id?: string;
  has_api_key: boolean;
  has_access_token: boolean;
  has_feed_token: boolean;
  is_2fa_enabled: boolean;
}

export interface Portfolio {
  holdings: Holding[];
  total_value: number;
  total_investment: number;
  profit_loss: number;
  profit_loss_percentage: number;
}

export interface Holding {
  symbol: string;
  quantity: number;
  avg_price: number;
  current_price: number;
}