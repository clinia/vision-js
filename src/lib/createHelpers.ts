import { insights } from '../helpers';
import { Record, InsightsClientMethod, InsightsClientPayload } from '../types';

type HoganRenderer = (value: any) => string;

interface HoganHelpers {
  formatNumber: (value: number, render: HoganRenderer) => string;
  insights: (options: string, render: HoganRenderer) => string;
}

export default function hoganHelpers({
  numberLocale,
}: {
  numberLocale?: string;
}): HoganHelpers {
  return {
    formatNumber(value, render) {
      return Number(render(value)).toLocaleString(numberLocale);
    },
    insights(this: Record, options, render) {
      try {
        type InsightsHelperOptions = {
          method: InsightsClientMethod;
          payload: Partial<InsightsClientPayload>;
        };
        const { method, payload }: InsightsHelperOptions = JSON.parse(options);

        return render(insights(method, { ids: [this.id], ...payload }));
      } catch (error) {
        throw new Error(`
The insights helper expects a JSON object of the format:
{ "method": "method-name", "payload": { "eventName": "name of the event" } }`);
      }
    },
  };
}
