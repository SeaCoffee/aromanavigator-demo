import ForumTopicForm from '@/app/components/forum/ForumTopicForm';
import type { ForumSection, ForumTopic } from '@/app/types/forumTypes';

type Props = {
  sections: ForumSection[];
  initialSectionId?: number | null;
  refreshPaths?: string[];
  onCreated?: (topic: ForumTopic) => void;
};

export default function ForumTopicCreateForm(props: Props) {
  return (
    <ForumTopicForm
      mode="create"
      sections={props.sections}
      initialSectionId={props.initialSectionId}
      refreshPaths={props.refreshPaths}
      onSaved={props.onCreated}
    />
  );
}
