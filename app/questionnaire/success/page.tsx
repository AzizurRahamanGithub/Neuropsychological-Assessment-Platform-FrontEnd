'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home } from 'lucide-react';

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-900">
            Grazie!
          </CardTitle>
          <CardDescription className="text-green-700">
            Il tuo questionario è stato inviato con successo
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
            <p>
              I tuoi dati sono stati ricevuti e salvati in modo sicuro. Il tuo clinico avrà accesso 
              ai risultati e potrebbe contattarti con i prossimi step.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Cosa fare adesso:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Attendi il contatto dal tuo clinico</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Se hai altri questionari assegnati, riceverai nuovi link</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Tutti i tuoi dati sono salvati localmente, quindi non andranno persi</span>
              </li>
            </ul>
          </div>

          <Link href="/">
            <Button className="w-full gap-2">
              <Home size={20} />
              Torna alla Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
