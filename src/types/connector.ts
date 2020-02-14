import { SearchResults } from '@clinia/search-helper';
import { Records, Vision } from './vision';
import { InsightsClient } from './insights';

export type RendererOptions<TWidgetParams = unknown> = {
  /**
   * Original parameters for this widget.
   * Useful for giving back the render parameters to the renderer.
   */
  widgetParams: TWidgetParams;
  visionInstance: Vision;
  results?: SearchResults;
  records?: Records;
  insights?: InsightsClient;
};

export type Renderer<TRenderOptions extends RendererOptions = any> = (
  renderOptions: TRenderOptions,
  isFirstRender: boolean
) => void;

export type Unmounter = () => void;
