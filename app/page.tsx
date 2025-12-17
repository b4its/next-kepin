'use-client'
import { Button } from "@/components/ui/button"
import Link from "next/link";
export default function Home() {
  return (
      <div style={{        
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
      }}>
                <Button asChild>
                  <Link href="/login">Login</Link>
                </Button>
      </div>
);
}
