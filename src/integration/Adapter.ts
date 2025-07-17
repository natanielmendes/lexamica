export interface Adapter {
  normalize(input: any): any;
  transformToTarget(input: any): any;
}
