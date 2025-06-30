import { getTransformedDataServerSafe } from 'app/api/widgets/[widgetId]/transformed-data/transformations';
import { API_DOMAIN } from 'constants/api.constants';
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_TRANSFORMED_DATA } from '@/modules/widgets/widgets.constant';

export async function GET(request: NextRequest, { params }: { params: Promise<{ widgetId: string }> }) {
  try {
    const { widgetId } = await params;
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    const sheetId = searchParams.get('sheetId');

    const authHeaders: Record<string, string> = {
      Accept: 'application/json',
    };

    authHeaders['X-Zamp-Organization-Id'] = request.headers.get('x-zamp-organization-id') ?? '';
    authHeaders['X-ZAMP-CSRF'] = request.headers.get('x-zamp-csrf') ?? '';
    authHeaders['X-Platform'] = request.headers.get('x-platform') ?? '';
    authHeaders['X-Canary'] = request.headers.get('x-canary') ?? '';
    authHeaders['Authorization'] = request.headers.get('authorization') ?? '';
    authHeaders['Cookie'] = request.headers.get('cookie') ?? '';

    const sheetDetailsUrl = `${API_DOMAIN}/pages/${pageId}/sheets/${sheetId}`;
    const widgetDataUrl = `${API_DOMAIN}/widgets/${widgetId}/data?${searchParams.toString()}`;

    const [widgetDataResponse, widgetInstanceResponse] = await Promise.all([
      fetch(widgetDataUrl, {
        method: 'GET',
        headers: authHeaders,
      }),
      fetch(sheetDetailsUrl, {
        method: 'GET',
        headers: { ...authHeaders, 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=30' },
      }),
    ]);

    const widgetsList = await widgetInstanceResponse.json();
    const widgetInstanceData = widgetsList?.widget_instances?.find(
      (widget: any) => widget.widget_instance_id === widgetId,
    );

    if (!widgetDataResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch widget dataaaa', status: widgetDataResponse.status },
        { status: widgetDataResponse.status },
      );
    }

    const widgetData = await widgetDataResponse.json();

    const transformedResult = widgetData?.result
      ? getTransformedDataServerSafe(widgetData.result, widgetInstanceData, widgetData.currency || 'USD')
      : DEFAULT_TRANSFORMED_DATA;

    return NextResponse.json(transformedResult);
  } catch (error) {
    console.error('BFF GET Error:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ widgetId: string }> }) {
  try {
    await params; // Consume params to satisfy Next.js requirements
    const body = await request.json();

    const { widgetData, widgetInstance, currency } = body;

    if (!widgetData || !widgetInstance) {
      return NextResponse.json(
        { error: 'Missing required data: widgetData and widgetInstance are required' },
        { status: 400 },
      );
    }

    const transformedResult = widgetData?.result
      ? getTransformedDataServerSafe(widgetData.result, widgetInstance, currency)
      : DEFAULT_TRANSFORMED_DATA;

    return NextResponse.json(transformedResult);
  } catch (error) {
    console.error('BFF Transformation Error:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
