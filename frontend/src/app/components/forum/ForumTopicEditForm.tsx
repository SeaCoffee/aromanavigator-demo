import ForumTopicForm from '@/app/components/forum/ForumTopicForm';
import type { ForumTopic } from '@/app/types/forumTypes';

type Props = {
  topic: ForumTopic;
  refreshPaths?: string[];
  onSaved?: (topic: ForumTopic) => void;
};

export default function ForumTopicEditForm(props: Props) {
  return (
    <ForumTopicForm
      mode="edit"
      topic={props.topic}
      refreshPaths={props.refreshPaths}
      onSaved={props.onSaved}
    />
  );
}
