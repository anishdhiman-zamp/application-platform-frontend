import Dagre from '@dagrejs/dagre';
import { type Edge, type Node } from '@xyflow/react';
import { S3_INGESTION_EDGE_LABEL } from 'modules/admin/admin.constants';
import { AdminDatasetListingResponseType, DisplayConfigType, GetDatasetDagResponseType } from 'types/api/admin.types';
import { DatasetFilterConfigResponseType } from '@/types/api/dataset.types';

export const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  g.setGraph({ rankdir: 'TB' });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    }),
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

export const createNodeAndEdgeList = (
  data: GetDatasetDagResponseType,
  datasetListing: AdminDatasetListingResponseType,
) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  Object.keys(data.dag).forEach((key) => {
    const node = data.dag[key];
    const edge = node.EdgeConfig;
    const parents = node.Parents;
    const datasetLabel = datasetListing.datasets.find((dataset) => dataset.ID === node.NodeId)?.Title ?? node.NodeId;

    nodes.push({ id: node.NodeId, data: { label: datasetLabel, nodeType: node.NodeType }, position: { x: 0, y: 0 } });
    parents?.forEach((parent) => {
      if (edge) {
        const edgeId = edge.job_id.toString();

        if (edge.source_dataset_id === parent.NodeId) {
          edges.push({
            id: edgeId,
            source: edge.source_dataset_id,
            target: node.NodeId,
            label: edge.template_id ?? edgeId,
          });
        } else if (edge.downstream_jobs_source_value) {
          edges.push({
            id: edgeId,
            source: parent.NodeId,
            target: node.NodeId,
            label: S3_INGESTION_EDGE_LABEL,
          });
        } else {
          edges.push({
            id: parent.NodeId,
            source: parent.NodeId,
            target: node.NodeId,
          });
        }
      }
    });
  });

  return { nodes, edges };
};

export const transformDatasetFilterConfigResponseTypeToDisplayConfigType = (
  data: DatasetFilterConfigResponseType[],
): DisplayConfigType[] => {
  return (
    data.map((item) => ({
      column: item.column,
      alias: item.alias,
      is_hidden: item.metadata?.is_hidden ?? false,
      is_editable: item.metadata?.is_editable ?? false,
      type: item.metadata?.custom_type,
      config: item.metadata?.config,
    })) ?? []
  );
};
