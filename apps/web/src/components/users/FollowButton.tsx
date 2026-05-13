'use client'

import { useRouter } from 'next/navigation'
import { UserPlus, UserCheck } from 'lucide-react'
import { Button } from '@repo/ui'
import { useFollow, useUnfollow } from '@/hooks/use-follow'
import { useMe } from '@/hooks/use-auth'

interface FollowButtonProps {
  username: string
  isFollowing: boolean
  userId: string
}

export function FollowButton({ username, isFollowing, userId }: FollowButtonProps) {
  const router = useRouter()
  const { data: meData } = useMe()
  const me = meData?.data
  const follow = useFollow(username)
  const unfollow = useUnfollow(username)

  if (me?.id === userId) return null

  const handleClick = () => {
    if (!me) { router.push('/login'); return }
    if (isFollowing) {
      unfollow.mutate()
    } else {
      follow.mutate()
    }
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
      onClick={handleClick}
      disabled={follow.isPending || unfollow.isPending}
      className="gap-1.5"
    >
      {isFollowing ? (
        <><UserCheck className="h-4 w-4" />Following</>
      ) : (
        <><UserPlus className="h-4 w-4" />Follow</>
      )}
    </Button>
  )
}
