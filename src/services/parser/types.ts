export interface StrategyResult {
  titulo: string;
  dataBase: Date;
  recorrenciaDias?: number;
}

export interface Strategy {
  name: string;
  priority: number;
  matches(frase: string): boolean;
  parse(frase: string, hoje: Date): StrategyResult[];
}
