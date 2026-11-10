import { cn } from '@/lib/utils';

type StaticContentProps = {
  title: string;
  children?: React.ReactNode;
  className?: string;
};

const StaticContent = ({ title, children, className }: StaticContentProps) => {
  return (
    <article
      className={cn(
        'fadein w-full min-w-0 max-w-full text-base leading-relaxed text-gray-600 dark:text-gray-300',
        className,
      )}
    >
      <h1 className="text-3xl font-semibold leading-tight">{title}</h1>
      {children ? (
        <div
          className={cn(
            'mt-8 flex flex-col gap-10',
            '[&_a]:underline [&_a]:underline-offset-4',
            '[&_blockquote]:border-l-2 [&_blockquote]:border-gray-400 [&_blockquote]:pl-4 [&_blockquote]:italic dark:[&_blockquote]:border-gray-600',
            '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:leading-snug',
            '[&_h3]:text-base [&_h3]:font-semibold',
            '[&_section]:flex [&_section]:flex-col [&_section]:gap-3',
            '[&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-6',
          )}
        >
          {children}
        </div>
      ) : null}
    </article>
  );
};

export default StaticContent;
