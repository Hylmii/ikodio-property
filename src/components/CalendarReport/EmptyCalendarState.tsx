import { Card, CardContent } from '@/components/ui/card';

interface EmptyCalendarStateProps {
  hasProperties: boolean;
  hasSelection: boolean;
}

export function EmptyCalendarState({ hasProperties, hasSelection }: EmptyCalendarStateProps) {
  if (!hasProperties) {
    return (
      <Card className="border-slate-200 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Properties Yet</h3>
            <p className="text-slate-600 mb-4">
              You don't have any properties yet. Create a property first to view availability.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasSelection) {
    return (
      <Card className="border-slate-200 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Select Property and Room</h3>
            <p className="text-slate-600">
              Choose a property and room to view the availability calendar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
