'use client';

type ColorPickerProps = {
  label: string;
  name: string;
  defaultValue: string;
};

export function ColorPicker({ label, name, defaultValue }: ColorPickerProps) {
  return (
    <label className="block rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-4">
      <span className="text-sm font-semibold text-[#d0d0dc]">{label}</span>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="color"
          name={name}
          defaultValue={defaultValue}
          className="h-10 w-14 rounded border border-[#1e1e24] bg-transparent"
        />
        <input
          name={`${name}Text`}
          defaultValue={defaultValue}
          className="flex-1 rounded-lg border border-[#1e1e24] bg-[#0a0a0d] px-3 py-2 text-sm text-[#d0d0dc]"
          onChange={(event) => {
            const colorInput = event.currentTarget
              .previousElementSibling as HTMLInputElement | null;
            if (colorInput && /^#[0-9a-fA-F]{6}$/.test(event.currentTarget.value)) {
              colorInput.value = event.currentTarget.value;
            }
          }}
        />
      </div>
    </label>
  );
}
