declare module "*.mp3" {
  const src: string;
  export default src;
}
declare module 'react-icons/*' {
  import { IconType } from 'react-icons';
  const icon: IconType;
  export default icon;
}