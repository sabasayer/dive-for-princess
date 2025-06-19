class Logger {
  private isProd: boolean;
  private lastLog = "";

  constructor() {
    this.isProd =
      typeof import.meta.env !== "undefined" && import.meta.env.PROD;
  }

  log(...args: unknown[]) {
    if (this.isProd) return;
    console.log(
      "%c[LOG]",
      "background: #222; color: #bada55; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
      ...args,
    );
  }

  logDedup(...args: unknown[]) {
    if (this.isProd) return;
    const message = args.join(" ");
    if (message === this.lastLog) return;
    this.lastLog = message;
    console.log(
      "%c[LOG]",
      "background: #222; color: #bada55; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
      ...args,
    );
  }

  warn(...args: unknown[]) {
    if (this.isProd) return;
    console.warn(
      "%c[WARN]",
      "background: #ffcc00; color: #222; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
      ...args,
    );
  }

  error(...args: unknown[]) {
    if (this.isProd) return;
    console.error(
      "%c[ERROR]",
      "background: #ff4444; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
      ...args,
    );
  }

  table(table: unknown[], columns: string[]) {
    if (this.isProd) return;
    console.table(table, columns);
  }
}

export const logger = new Logger();
