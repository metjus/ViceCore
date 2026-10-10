import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Blízko — veci pre ďalší príbeh',description:'Bazár s priamym chatom. Nájdite veci vo svojom okolí a dohodnite sa bez zverejňovania e-mailu.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="sk"><body>{children}</body></html>}
