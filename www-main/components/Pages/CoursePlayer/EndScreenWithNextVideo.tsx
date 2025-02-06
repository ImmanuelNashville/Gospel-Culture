import Button from 'components/Button';
import Card from '../../Card';

export function EndScreenWithNextVideo({
  onConfirmClick,
  onCancelClick,
  imageUrl,
  text,
}: {
  onConfirmClick: () => void;
  onCancelClick: () => void;
  imageUrl: string | null;
  text: string;
}) {
  return (
    <div className="relative -top-4 bg-white/20 dark:bg-black/20 backdrop-blur-3xl backdrop-saturate-150 w-full rounded-2xl p-6 shadow-xl">
      {imageUrl && (
        <Card
          imageUrl={imageUrl}
          className="w-full hidden lg:block shadow-none drop-shadow-none"
          innerClassName="drop-shadow-none rounded-lg shadow-none"
        />
      )}
      <p className="text-body font-bodycopy text-white text-center mt-4">{text}</p>
      <div className="mt-4 flex flex-col md:flex-row gap-3 mx-auto justify-center leading-normal">
        <Button variant="glassSecondary" onClick={onCancelClick}>
          Stay Here
        </Button>

        <Button variant="glassPrimary" onClick={onConfirmClick}>
          Play Now
        </Button>
      </div>
    </div>
  );
}
