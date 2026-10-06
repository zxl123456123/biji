export function PetDevModelPicker({ onSelect, error }: { onSelect(file: File): void; error: string }) {
  return <div className="pet-dev-model-picker">
    <label>本机模型预览<input type="file" accept=".glb,model/gltf-binary" onChange={event => {
      const file = event.currentTarget.files?.[0]
      if (file) onSelect(file)
      event.currentTarget.value = ''
    }}/></label>
    <small>仅在此页面预览；配色和装扮暂不作用于三维模型。</small>
    {error && <p role="alert">模型预览失败：{error}。已显示原画像。</p>}
  </div>
}
