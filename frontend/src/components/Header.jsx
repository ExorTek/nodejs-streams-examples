function Header({
  title = 'Node.js Stream Playground',
  description = 'Explore and test various Node.js stream types and functionalities.',
}) {
  return (
    <div className={'mb-8'}>
      <h1 className={'text-3xl font-bold text-white mb-2'}>{title}</h1>
      <p className={'text-gray-300'}>{description}</p>
    </div>
  );
}

export default Header;
