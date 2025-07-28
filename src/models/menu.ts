export interface BeginnerMenu {
  title: string;
  icon: string;
  url: string | null;
  disabled?: boolean;
  module?: string;
  children?: BeginnerMenu[];
}
