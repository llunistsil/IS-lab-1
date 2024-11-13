export type User = {
  username: string;
  token: string;
  accountType: AccountType;
};

export enum AccountType {
  User = 'USER',
  Admin = 'ADMIN',
}