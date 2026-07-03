import MediaImage from '@/app/components/images/MediaImage';
import type { ObjectAttachmentPhoto } from '@/app/types/photoTypes';
import { articleContentBlocks } from '@/app/utils/articleContentUtils';

type Props = {
  content: string;
  photos: ObjectAttachmentPhoto[];
};

export default function ArticleContent({ content, photos }: Props) {
  return (
    <div className="grid gap-5 text-sm font-medium leading-7 text-[#5f534c]">
      {articleContentBlocks(content, photos).map((block, index) =>
        block.kind === 'photo' ? (
          <figure
            key={`photo-${block.photo.id}-${index}`}
            className="overflow-hidden rounded-2xl border border-[#eadfd5] bg-[#f6efe8]"
          >
            <MediaImage
              src={block.photo.image}
              alt={`Р—РѕР±СЂР°Р¶РµРЅРЅСЏ Сѓ СЃС‚Р°С‚С‚С– ${index + 1}`}
              className="max-h-[620px] w-full object-contain"
              fallbackClassName="grid min-h-48 place-items-center text-sm text-[#8a7668]"
              fallback="Р—РѕР±СЂР°Р¶РµРЅРЅСЏ РЅРµРґРѕСЃС‚СѓРїРЅРµ"
            />
          </figure>
        ) : (
          <div
            key={`text-${index}`}
            className="whitespace-pre-wrap break-words"
          >
            {block.value}
          </div>
        ),
      )}
    </div>
  );
}
